import { SecretSantaDrawService } from './secret-santa-draw.service';
import { SecretSantaUserEntity } from './secret-santa.entity';

describe('SecretSantaDrawService', () => {
  const drawService = new SecretSantaDrawService();

  it('should throw error if not enough attendees', () => {
    // Given
    const secretSantaUsers: SecretSantaUserEntity[] = [getUserEntity('1', [])];

    // When Then
    expect(() => drawService.assignSecretSantas(secretSantaUsers)).toThrowError(
      "Pas assez d'utilisateurs pour tirer au sort.",
    );
  });

  it('should assign secret Santas for 2 attendees without exceptions', () => {
    // Given
    const secretSantaUsers: SecretSantaUserEntity[] = [getUserEntity('1', []), getUserEntity('2', [])];

    // When
    const assignedUsers = drawService.assignSecretSantas(secretSantaUsers);

    // Then
    expect(assignedUsers[0]).toEqual({ userId: '1', drawUserId: '2' });
    expect(assignedUsers[1]).toEqual({ userId: '2', drawUserId: '1' });
  });

  it('should throw error when secret Santas for 2 attendees with exceptions', () => {
    // Given
    const secretSantaUsers: SecretSantaUserEntity[] = [getUserEntity('1', ['2']), getUserEntity('2', [])];

    // When Then
    expect(() => drawService.assignSecretSantas(secretSantaUsers)).toThrowError(
      'Impossible de tirer au sort un utilisateur en raison des exclusions.',
    );
  });

  it('should assign secret Santas for 3 attendees with only 1 exception', () => {
    // Given
    const secretSantaUsers: SecretSantaUserEntity[] = [
      getUserEntity('1', []),
      getUserEntity('2', []),
      getUserEntity('3', ['1']),
    ];

    // When
    const assignedUsers = drawService.assignSecretSantas(secretSantaUsers);

    // Then
    expect(assignedUsers[0].drawUserId).toEqual('3');
    expect(assignedUsers[1].drawUserId).toEqual('1');
    expect(assignedUsers[2].drawUserId).toEqual('2');
  });
});

function getUserEntity(id: string, exclusions: string[]): SecretSantaUserEntity {
  const entity = new SecretSantaUserEntity();
  entity.id = id;
  entity.exclusions = exclusions;
  return entity;
}
