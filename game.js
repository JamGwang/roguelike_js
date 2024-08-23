import chalk from 'chalk';
import readlineSync from 'readline-sync';

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));
class Player {
  constructor() {
    this._maxHp = 125;
    this._hp = 125;
    this._atk = 20;
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
  get runaway() {
    return this._runaway;
  }

  attack(mob) {
    // 플레이어의 공격
    mob._hp -= this._atk;
    return this._atk;
  }
  heal(value) {
    let healing = this.maxHp * (value / 100);
    // 회복
    if (this._hp + healing < this._maxHp)
      this._hp += healing;
    else
      this._hp = this.maxHp;

    return healing;
  }
}

class Monster {
  constructor() {
    this._maxHp = 50;
    this._hp = 50;
    this._atk = 5;
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
    this._atk = 5 + (value * 5);
    this._hp = 50 + (value * 25);
    this._maxHp = 50 + (value * 25);
  }

  attack(p) {
    // 몬스터의 공격
    p._hp -= this.atk;
    return this.atk;
  }

}
// 전투 승리보상 목록
let rewards = [{
  name: '미약한 힘의 정수',
  code: '_atk',
  rarity: 5,
  effect: 7,
  comment: `공격력`
},
{
  name: '힘의 정수',
  code: '_atk',
  rarity: 2,
  effect: 12,
  comment: `공격력`
},
{
  name: '미약한 활력의 정수',
  code: '_hp',
  rarity: 5,
  effect: 15,
  comment: `체력`
},
{
  name: '활력의 정수',
  code: '_hp',
  rarity: 5,
  effect: 25,
  comment: `체력`
},
{
  name: '바람의 정수',
  code: '_runaway',
  rarity: 1,
  effect: 5,
  comment: `도망 확률`
}];

let rewardstable = [];

function setReward() {
  for (let i = 0; i < rewards.length; i++) {
    for (let j = 0; j < rewards[i].rarity; j++) {
      rewardstable.push(rewards[i]);
    }
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n==== Current Status ======================`));
  //console.log(chalk.whiteBright(`현재 보상 풀 ${rewardstable.length}`)); //보상 풀 체크
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
  let escape = false;

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    if (monster.hp <= 0) { // 전투 승리
      logs = logs.slice(logs.length - 1); // 마지막 피해 로그
      logs.push(chalk.cyanBright(`적을 쓰러뜨렸습니다!`));
      reward(player, logs);
      let healing = player.heal(20);
      logs.push(chalk.greenBright(`체력을 ${healing}회복 합니다.`));
      logs.push(chalk.gray(`다음 스테이지로 이동하려면 아무거나 입력하세요.`));

      logs.forEach((log) => console.log(log));
      //로그 출력 후 아무거나 입력받고 반복 종료
      do {
        const clicktonext = readlineSync.question();
        switch (clicktonext) {
          default:
            break;
        }
      } while (false)
      break;
    }
    if (escape) { // 도망치기      
      escape = false;
      if (randomRoll(100) > player.runaway) {
        logs = [];
        logs.push(chalk.cyanBright(`적을 따돌리고 휴식을 취합니다.`));
        let healing = player.heal(30);
        logs.push(chalk.greenBright(`체력을 ${healing}회복 합니다.`));
        logs.push(chalk.gray(`다음 스테이지로 이동하려면 아무거나 입력하세요.`));
        logs.forEach((log) => console.log(log));
        //로그 출력 후 아무거나 입력받고 전투 종료
        do {
          const clicktonext = readlineSync.question();
          switch (clicktonext) {
            default:
              break;
          }
        } while (false)
        break;
      }
      else {
        logs = [];
        logs.push(chalk.redBright(`적을 따돌리는 데 실패했습니다!`));
        let dmg = monster.attack(player);
        logs.push(chalk.redBright(`${dmg}의 피해를 입었습니다.`));
        console.clear();
        displayStatus(stage, player, monster);
      }
    }

    if (logs.length > 8) //로그 많으면 정리
      logs = logs.slice((logs.length - 8));
    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 3. 도망친다(${player.runaway}%). 6. 게임종료`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    //logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    // 행동 분기
    switch (choice) {
      case '1':
        let dmg = player.attack(monster);
        logs.push(chalk.greenBright(`${dmg}의 피해를 입혔습니다.`));
        break;
      case '2':
        break;
      case '3':
        console.log(chalk.grey('몬스터를 따돌리는 중 입니다.'));
        await sleep(1000);
        escape = true;
        break;
      case '6':
        console.log(chalk.red('게임을 종료합니다.'));
        process.exit(0); // 게임 종료
      default:
        console.log(chalk.red('올바른 선택을 하세요.'));
    }
    if (monster.hp > 0 && !escape) {
      // 전투 지속 - 몬스터 턴
      let dmg = monster.attack(player);
      logs.push(chalk.redBright(`${dmg}의 피해를 입었습니다.`));
    }

  }
};

// 보상
function reward(player, logs) {
  let dice = Math.floor(randomRoll(rewardstable.length - 1));
  if (dice > rewardstable.length - 1) {
    console.log(chalk.red('보상 랜덤 오류'));
    return;
  }
  else {
    let name = rewardstable[dice].name;
    let code = rewardstable[dice].code;
    let eff = rewardstable[dice].effect;
    let comment = rewardstable[dice].comment;

    if (player[code] === undefined) {
      console.log(chalk.red('보상 능력치 코드 오류'));
      return;
    }
    else {
      player[code] += eff;
      logs.push(chalk.cyanBright(`${name}(을)를 얻었습니다!`));
      logs.push(chalk.cyanBright(`${comment}(이)가 ${eff}증가합니다!`));
    }
  }
}

function randomRoll(value) {
  return Math.random() * value;
}

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;
  setReward();
  while (stage <= 10) {
    const monster = new Monster(stage);
    monster.status = stage;
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    stage++;
  }
}