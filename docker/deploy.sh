#!/bin/bash

API_VERSION=$1
COMPOSE_FILE="docker-compose.yml"

if [ -z "${API_VERSION}" ]; then
  API_VERSION="latest"
fi

export API_VERSION

echo "🚀 Démarrage du déploiement avec scaling pour la version ${API_VERSION}"

# Fonction pour attendre qu'un service soit healthy
wait_for_healthy_instances() {
  local service_name=$1
  local expected_count=$2
  local max_attempts=60
  local attempt=0
  
  echo "⏳ Attente de ${expected_count} instances healthy de ${service_name}..."
  
  while [ $attempt -lt $max_attempts ]; do
    # Compter les instances healthy avec une approche plus compatible
    local healthy_count=$(docker compose -f $COMPOSE_FILE ps ${service_name} | grep -c "healthy")
    
    if [ "$healthy_count" -ge "$expected_count" ]; then
      echo "✅ ${healthy_count} instances de ${service_name} sont maintenant healthy"
      return 0
    fi
    
    echo "   -> ${healthy_count}/${expected_count} instances healthy..."
    attempt=$((attempt + 1))
    sleep 3
  done
  
  local final_count=$(docker compose -f $COMPOSE_FILE ps ${service_name} | grep -c "healthy")
  echo "❌ Seulement ${final_count}/${expected_count} instances sont healthy après $((max_attempts * 3)) secondes"
  return 1
}

# Fonction pour obtenir le nombre d'instances actives
get_running_instances() {
  local service_name=$1
  docker compose -f $COMPOSE_FILE ps ${service_name} | grep -v "NAME" | wc -l
}

# Fonction pour afficher le statut détaillé (debug)
show_detailed_status() {
  local service_name=$1
  echo "🔍 Statut détaillé de ${service_name}:"
  docker compose -f $COMPOSE_FILE ps ${service_name}
}

# Étape 1: Vérifier l'état actuel
echo "🔍 Vérification de l'état actuel..."
docker compose -f $COMPOSE_FILE ps api

current_instances=$(get_running_instances "api")
echo "📊 Instances actuelles: ${current_instances}"

# Étape 2: Scaler à 2 instances pour avoir de la redondance
echo "📈 Scaling à 2 instances pour avoir de la redondance..."
docker compose -f $COMPOSE_FILE up -d --scale api=2

# Attendre que les 2 instances soient healthy
if wait_for_healthy_instances "api" 2; then
  echo "✅ 2 instances sont maintenant running"
  show_detailed_status "api"
  
  # Étape 3: Télécharger la nouvelle image
  echo "📦 Téléchargement de la nouvelle image en version ${API_VERSION}..."
  docker compose -f $COMPOSE_FILE pull api
  
  # Étape 4: Obtenir les IDs des containers
  echo "🔍 Identification des containers..."
  api_containers=$(docker compose -f $COMPOSE_FILE ps -q api)
  container_array=($api_containers)
  
  if [ ${#container_array[@]} -eq 2 ]; then
    echo "📋 Containers trouvés: ${container_array[0]} et ${container_array[1]}"
    
    # Étape 5: Redémarrer le premier container
    echo "🔄 Redémarrage du premier container (${container_array[0]})..."
    docker stop ${container_array[0]}
    docker rm ${container_array[0]}
    
    # Relancer le service avec 2 instances
    docker compose -f $COMPOSE_FILE up -d --scale api=2
    
    # Attendre que nous ayons au moins 1 instance healthy
    if wait_for_healthy_instances "api" 1; then
      echo "✅ Premier container redémarré avec succès"
      
      # Attendre un peu pour la stabilisation
      sleep 5
      
      # Étape 6: Redémarrer le second container
      echo "🔄 Redémarrage du second container..."
      
      # Obtenir les nouveaux IDs
      api_containers=$(docker compose -f $COMPOSE_FILE ps -q api)
      container_array=($api_containers)
      
      if [ ${#container_array[@]} -eq 2 ]; then
        # Arrêter le second container (qui est probablement encore sur l'ancienne version)
        docker stop ${container_array[1]}
        docker rm ${container_array[1]}
        
        # Relancer le service avec 2 instances
        docker compose -f $COMPOSE_FILE up -d --scale api=2
        
        # Attendre que les 2 instances soient healthy
        if wait_for_healthy_instances "api" 2; then
          echo "✅ Tous les containers ont été mis à jour avec succès"
          
          # Étape 7: Optionnel - Revenir à 1 instance
          echo "❓ Voulez-vous revenir à 1 instance ? (garder 2 instances peut être mieux pour la production)"
          echo "📉 Retour à 1 instance dans 5 secondes (Ctrl+C pour annuler)..."
          sleep 5
          
          docker compose -f $COMPOSE_FILE up -d --scale api=1
          
          if wait_for_healthy_instances "api" 1; then
            echo "✅ Retour à 1 instance réussi"
          else
            echo "⚠️ Avertissement: Problème pour revenir à 1 instance, remise à 2 instances"
            docker compose -f $COMPOSE_FILE up -d --scale api=2
          fi
        else
          echo "❌ Échec de la mise à jour du second container"
          exit 1
        fi
      else
        echo "❌ Problème avec l'identification des containers après le premier redémarrage"
        exit 1
      fi
    else
      echo "❌ Échec du redémarrage du premier container"
      exit 1
    fi
  else
    echo "❌ Problème avec l'identification des containers (trouvé ${#container_array[@]} au lieu de 2)"
    exit 1
  fi
  
  # Nettoyage des anciennes images
  echo "🧹 Nettoyage des anciennes images..."
  docker image prune -a -f
  
  echo "🎉 Déploiement avec scaling terminé avec succès !"
  echo "📊 État final des services:"
  docker compose -f $COMPOSE_FILE ps api
else
  echo "❌ Impossible de scaler à 2 instances"
  exit 1
fi

echo "✨ Déploiement sans downtime terminé !" 