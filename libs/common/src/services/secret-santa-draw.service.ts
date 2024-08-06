export type SecretSantaUser = { id: string; exclusions: string[] }
export type SecretSantaAssign = { userId: string; drawUserId: string }

export class SecretSantaDrawService {
  public assignSecretSantas(users: SecretSantaUser[]): SecretSantaAssign[] {
    if (users.length < 2) {
      throw new Error("Pas assez d'utilisateurs pour tirer au sort.")
    }

    const possibleDraws = this.getPossibleDraws(users)

    return this.draw(possibleDraws)
  }

  private getPossibleDraws(users: SecretSantaUser[]) {
    const sortedUsers = [...users].sort((a, b) => a.exclusions.length - b.exclusions.length)

    const possibleDraws: { userId: string; possibleDrawIds: string[] }[] = []
    const drawUserIds = new Set<string>()

    for (const user of sortedUsers) {
      const exclusions = [user.id, ...user.exclusions]
      const possibleDrawIds = sortedUsers.filter(u => !exclusions.includes(u.id)).map(u => u.id)

      if (possibleDrawIds.length === 0) {
        throw new Error('Impossible de tirer au sort un utilisateur en raison des exclusions.')
      }

      possibleDrawIds.forEach(id => drawUserIds.add(id))
      possibleDraws.push({ userId: user.id, possibleDrawIds })
    }

    if (drawUserIds.size !== users.length) {
      throw new Error('Impossible de tirer au sort un utilisateur en raison des exclusions.')
    }

    return possibleDraws
  }

  private draw(
    possibleDraws: { userId: string; possibleDrawIds: string[] }[],
    retryCount: number = 0,
  ): SecretSantaAssign[] {
    const finalDraws: SecretSantaAssign[] = []
    const drawnIds: string[] = []

    if (retryCount > 10) {
      throw new Error('Trop de tentatives de tirage au sort, le tirage ne semble pas correcte.')
    }

    for (const possibleDraw of possibleDraws) {
      const possibleDrawIds = possibleDraw.possibleDrawIds.filter(id => !drawnIds.includes(id))
      if (possibleDrawIds.length === 0) {
        return this.draw(possibleDraws, retryCount + 1)
      }
      const drawUserId = possibleDrawIds[Math.floor(Math.random() * possibleDrawIds.length)]
      drawnIds.push(drawUserId)
      finalDraws.push({ userId: possibleDraw.userId, drawUserId })
    }

    return finalDraws
  }
}
