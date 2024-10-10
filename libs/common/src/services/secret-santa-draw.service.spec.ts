import { SecretSantaDrawService, SecretSantaUser } from './secret-santa-draw.service'

describe('SecretSantaDrawService', () => {
  it('should throw error if not enough attendees', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [getUserEntity('1', [])]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When Then
    expect(() => drawService.assignSecretSantas()).toThrowError("Pas assez d'utilisateurs pour tirer au sort.")
  })

  it('should assign secret Santas for 2 attendees without exceptions', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [getUserEntity('1', []), getUserEntity('2', [])]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When
    const assignedUsers = drawService.assignSecretSantas()

    // Then
    expect(assignedUsers).toIncludeAllMembers([
      { userId: '1', drawUserId: '2' },
      { userId: '2', drawUserId: '1' },
    ])
  })

  it('should throw error when secret Santas for 2 attendees with exceptions', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [getUserEntity('1', ['2']), getUserEntity('2', [])]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When Then
    expect(() => drawService.assignSecretSantas()).toThrowError(
      'Impossible de tirer au sort un utilisateur en raison des exclusions.',
    )
  })

  it('should assign secret Santas for 3 attendees with only 1 exception', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [
      getUserEntity('1', []),
      getUserEntity('2', []),
      getUserEntity('3', ['1']),
    ]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When
    const assignedUsers = drawService.assignSecretSantas()

    // Then
    expect(assignedUsers).toIncludeAllMembers([
      { userId: '1', drawUserId: '3' },
      { userId: '2', drawUserId: '1' },
      { userId: '3', drawUserId: '2' },
    ])
  })

  it('should throw error if 2 attendee have the same uniq draw', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [
      getUserEntity('1', []),
      getUserEntity('2', ['1']),
      getUserEntity('3', ['1']),
    ]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When Then
    expect(() => drawService.assignSecretSantas()).toThrowError(
      'Impossible de tirer au sort un utilisateur en raison des exclusions.',
    )
  })

  it('should throw error if 3 attendee have the same uniq draw', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [
      getUserEntity('1', []),
      getUserEntity('2', ['1']),
      getUserEntity('3', ['1']),
      getUserEntity('4', ['1']),
    ]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When Then
    expect(() => drawService.assignSecretSantas()).toThrowError(
      'Impossible de tirer au sort un utilisateur en raison des exclusions.',
    )
  })

  it('should assign secret Santas for 4 attendees', () => {
    // Given
    const secretSantaUsers: SecretSantaUser[] = [
      getUserEntity('1', []),
      getUserEntity('2', []),
      getUserEntity('3', []),
      getUserEntity('4', []),
    ]
    const drawService = new SecretSantaDrawService(secretSantaUsers)

    // When
    const assignedUsers = drawService.assignSecretSantas()

    expect(assignedUsers).toBeArrayOfSize(4)
  })
})

function getUserEntity(id: string, exclusions: string[]): SecretSantaUser {
  return { id, exclusions }
}
