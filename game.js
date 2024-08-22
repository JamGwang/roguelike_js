import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this._maxHp = 100;
    this._hp = 100;
    this._atk = 30;
    this._counter = 30;
    this._runaway = 50;
  }

  get hp() {
    return this._hp;
  }
  get maxHp() {
    return this._maxHp;
  }
  get atk() {
    return this._atk;
  }
  get counter() {
    return this._counter;
  }

  attack(mob) {
    // 플레이어의 공격
    mob._hp -= this._atk;
    return this._atk;
  }
  Heal(value) {
    let healrate = value / 100;
    // 회복
    if (this._hp + (this._maxHp*healrate) < this._maxHp)
      this._hp += this._maxHp*healrate;
    else
      this._hp = this.maxHp;
  }
}

class Monster {
  constructor() {
    this._maxHp = 100;
    this._hp = 100;
    this._atk = 1;
  }

  get hp() {
    return this._hp;
  }
  get maxHp() {
    return this._maxHp;
  }
  get atk() {
    return this._atk;
  }
  set status(value) {
    this._atk = 10 + (value * 1);
    this._hp = 100 + (value * 20);
    this._maxHp = 100 + (value * 20);
  }

  attack(p) {
    // 몬스터의 공격
    p._hp -= this.atk;
    return this.atk;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n==== Current Status ======================`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 | 공격력: ${player.atk} 체력: ${player.hp}/${player.maxHp} `,
    ) +
    chalk.redBright(
      `| 몬스터 | 공격력: ${monster.atk} 체력: ${monster.hp}/${monster.maxHp}`,
    ),
  );
  console.log(chalk.magentaBright(`==========================================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);
    if (logs.length > 8) //로그 많으면 정리
      logs = logs.slice((logs.length - 8));
    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 도망친다(${player.runaway}%). 4. 게임종료`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    //logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    // 행동 분기
    switch (choice) {
      case '1':
        let dmg = player.attack(monster); // 공격 메소드 실행
        logs.push(chalk.greenBright(`${dmg}의 피해를 입혔습니다.`));
        break;
      case '2':
        break;
      case '3':
        break;
      case '4':
        console.log(chalk.red('게임을 종료합니다.'));
        process.exit(0); // 게임 종료
      default:
        console.log(chalk.red('올바른 선택을 하세요.'));
    }
    if (monster.hp > 0) {
      // 전투 지속 - 몬스터 턴
      let dmg = monster.attack(player);
      logs.push(chalk.redBright(`${dmg}의 피해를 입었습니다.`));
    }
    else {
      // 전투 종료
      let rw = reward();
      if(player[rw] !== undefined)
        player[rw] += 10;
      player.Heal(30);
      break;
    }
  }
};

function reward() {
  let dice = randomRoll();
  switch (true) {    
    case (dice < 33):
      return '_maxHp';
    case (dice < 66):
      return '_atk';
    default:
      break;
  }
}

function randomRoll() {
  return Math.random()*100;
}

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    monster.status = stage;
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    stage++;
  }
}