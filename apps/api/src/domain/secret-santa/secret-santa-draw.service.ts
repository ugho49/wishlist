import { SecretSantaUserEntity } from './secret-santa.entity';

export class SecretSantaDrawService {
  private isValidDraw(user: SecretSantaUserEntity, drawUser: SecretSantaUserEntity): boolean {
    return !user.exclusions.includes(drawUser.id);
  }

  private generateAllPossibleDraws(users: SecretSantaUserEntity[]): SecretSantaUserEntity[][] {
    if (users.length <= 1) {
      return [users];
    }

    const [first, ...rest] = users;
    const restDraws = this.generateAllPossibleDraws(rest);

    return restDraws.flatMap((draw) => {
      return Array.from({ length: draw.length + 1 }, (_, index) => {
        const drawCopy = draw.slice();
        drawCopy.splice(index, 0, first);
        return drawCopy;
      });
    });
  }

  private findValidDraw(users: SecretSantaUserEntity[]): SecretSantaUserEntity[] | undefined {
    const possibleDraws = this.generateAllPossibleDraws(users);

    for (const draw of possibleDraws) {
      let valid = true;

      for (let i = 0; i < users.length; i++) {
        if (!this.isValidDraw(users[i], draw[i])) {
          valid = false;
          break;
        }
      }

      if (valid) {
        return draw;
      }
    }

    return undefined;
  }

  public assignSecretSantas(secretSantaUsers: SecretSantaUserEntity[]): SecretSantaUserEntity[] {
    const sortedUsers = [...secretSantaUsers].sort((a, b) => a.exclusions.length - b.exclusions.length);

    sortedUsers.forEach((user) => (user.drawUserId = undefined));

    const validDraw = this.findValidDraw(sortedUsers);

    if (!validDraw) {
      throw new Error('Impossible de tirer au sort un utilisateur en raison des exclusions.');
    }

    for (let i = 0; i < sortedUsers.length; i++) {
      sortedUsers[i].drawUserId = validDraw[i].id;
    }

    return sortedUsers;
  }
}
