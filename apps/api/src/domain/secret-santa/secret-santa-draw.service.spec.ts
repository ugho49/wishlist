import { SecretSantaDrawService } from './secret-santa-draw.service';
import { SecretSantaUserEntity } from './secret-santa.entity';

describe('SecretSantaDrawService', () => {
  const drawService = new SecretSantaDrawService();

  it('should assign secret Santas without self-assignment', () => {
    const secretSantaUsers: SecretSantaUserEntity[] = [
      getUserEntity('1', []),
      getUserEntity('2', []),
      getUserEntity('3', ['1']),
    ];

    const assignedUsers = drawService.assignSecretSantas(secretSantaUsers);

    // Check that each user has a drawUserId assigned
    expect(assignedUsers.every((user) => typeof user.drawUserId === 'string')).toBe(true);

    // Check that no user is assigned to itself
    expect(assignedUsers.every((user) => user.id !== user.drawUserId)).toBe(true);

    // You can add more specific assertions based on your requirements
  });

  it('should throw an error for impossible draws', () => {
    const drawService = new SecretSantaDrawService();

    const secretSantaUsers: SecretSantaUserEntity[] = [getUserEntity('1', []), getUserEntity('2', ['1'])];

    expect(() => drawService.assignSecretSantas(secretSantaUsers)).toThrowError(
      'Impossible de tirer au sort un utilisateur en raison des exclusions.',
    );
  });
});

function getUserEntity(id: string, exclusions: string[]): SecretSantaUserEntity {
  const entity = new SecretSantaUserEntity();
  entity.id = id;
  entity.exclusions = exclusions;
  return entity;
}
