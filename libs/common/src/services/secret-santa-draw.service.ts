export type SecretSantaUser = { id: string; exclusions: string[] }
export type SecretSantaAssign = { userId: string; drawUserId: string }

export class SecretSantaDrawError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SecretSantaDrawError'
  }
}

export class SecretSantaDrawService {
  constructor(private readonly users: SecretSantaUser[]) {}

  public assignSecretSantas(): SecretSantaAssign[] {
    if (this.users.length < 2) {
      throw new SecretSantaDrawError("Pas assez d'utilisateurs pour tirer au sort.")
    }

    const possibleDraws = this.getPossibleDraws()

    return this.draw(possibleDraws)
  }

  public isDrawPossible(): { isPossible: boolean; reason?: string } {
    try {
      this.assignSecretSantas()
      return { isPossible: true }
    } catch (error) {
      let reason = 'Une erreur est survenue'
      if (error instanceof SecretSantaDrawError) reason = error.message
      return { isPossible: false, reason }
    }
  }

  private getPossibleDraws() {
    const sortedUsers = [...this.users].sort((a, b) => a.exclusions.length - b.exclusions.length)

    const possibleDraws: { userId: string; possibleDrawIds: string[] }[] = []
    const drawUserIds = new Set<string>()

    for (const user of sortedUsers) {
      const exclusions = [user.id, ...user.exclusions]
      const possibleDrawIds = sortedUsers.filter(u => !exclusions.includes(u.id)).map(u => u.id)

      if (possibleDrawIds.length === 0) {
        throw new SecretSantaDrawError('Impossible de tirer au sort un utilisateur en raison des exclusions.')
      }

      possibleDrawIds.forEach(id => drawUserIds.add(id))
      possibleDraws.push({ userId: user.id, possibleDrawIds })
    }

    if (drawUserIds.size !== this.users.length) {
      throw new SecretSantaDrawError('Impossible de tirer au sort un utilisateur en raison des exclusions.')
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
      throw new SecretSantaDrawError('Le tirage ne semble pas correcte.')
    }

    for (const possibleDraw of possibleDraws) {
      const possibleDrawIds = possibleDraw.possibleDrawIds.filter(id => !drawnIds.includes(id))
      if (possibleDrawIds.length === 0) {
        return this.draw(possibleDraws, retryCount + 1)
      }
      const drawUserId = possibleDrawIds[Math.floor(Math.random() * possibleDrawIds.length)]
      if (!drawUserId) {
        throw new SecretSantaDrawError('Impossible de tirer au sort un utilisateur en raison des exclusions.')
      }
      drawnIds.push(drawUserId)
      finalDraws.push({ userId: possibleDraw.userId, drawUserId })
    }

    return finalDraws
  }
}
