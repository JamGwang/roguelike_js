import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import {start} from "./server.js";

//원하는 시간(ms) 만큼 지연시키기 위한 promise반환 함수
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
    let healing = Math.floor(this._maxHp * (value / 100));
    // 회복
    if (this._hp + healing < this._maxHp)
      this._hp += healing;
    else {
      healing = this._maxHp - this._hp;
      this._hp = this._maxHp;
    }

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
  // 스테이지 증가에 비례한 스텟 상승, 랜덤 확률로 높은 스탯의 몬스터 생성
  set status(value) {
    this._atk = 5 + (randomRoll(100) <= 30 ? value+2 : value);    
    this._maxHp = 50 + (randomRoll(100) <= 55 ? value*17 : value*15);
    this._hp = this._maxHp;
  }

  attack(p) {
    // 몬스터의 공격
    p._hp -= this.atk;
    return this.atk;
  }

}
// 전투 승리보상 목록
// 정해진 형태 내에서 얼마든지 추가 가능
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
  rarity: 3,
  effect: 12,
  comment: `공격력`
},
{
  name: '미약한 활력의 정수',
  code: '_maxHp',
  rarity: 5,
  effect: 15,
  comment: `최대 체력`
},
{
  name: '활력의 정수',
  code: '_maxHp',
  rarity: 3,
  effect: 25,
  comment: `최대 체력`
},
{
  name: '은신 로브',
  code: '_runaway',
  rarity: 3,
  effect: 5,
  comment: `도망 확률`
},
{
  name: '반격의 서',
  code: '_counter',
  rarity: 3,
  effect: 15,
  comment: `반격 확률`
}];
// 보상을 랜덤하게 뽑기 위해 모아두는 배열
let rewardstable = [];
// rewardstable 배열에 각 보상이 지닌 가중치만큼 반복해서 push
function setReward() {
  for (let i = 0; i < rewards.length; i++) {
    for (let j = 0; j < rewards[i].rarity; j++) {
      rewardstable.push(rewards[i]);
    }
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
  let escape = false;
  let counter = false;

  while (player.hp > 0) {
    counter = false;
    console.clear();
    displayStatus(stage, player, monster);

    if (monster.hp <= 0) { // 전투 승리
      logs = logs.slice(logs.length - 1); // 마지막 로그(흐름 상 플레이어가 마지막으로 준 피해)
      logs.push(chalk.cyanBright(`적을 쓰러뜨렸습니다!`));
      reward(player, logs);
      let healing = player.heal(20);
      logs.push(chalk.greenBright(`체력을 ${healing}회복 합니다.`));
      logs.push(chalk.gray(`다음 스테이지로 이동하려면 아무거나 입력하세요.`));
      logs.forEach((log) => console.log(log));
      // 로그 출력 후 아무거나 입력받고 반복 종료
      do {
        const clicktonext = readlineSync.question();
        switch (clicktonext) {
          default:
            break;
        }
      } while (false)
      break;
    }
    if (escape) { // 도망치기에 성공 시, 체력 회복 후 다음 스테이지. 실패 시 피해입음
      escape = false;
      if (randomRoll(100) < player.runaway) {
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
        if (player.hp <= 0) break;
      }
    }

    if (logs.length > 8) //로그 많으면 정리
      logs = logs.slice((logs.length - 8));
    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2.반격한다(${player.counter}%) 3. 도망친다(${player.runaway}%). 6. 게임종료`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 행동 분기
    switch (choice) {
      case '1': // 일반 공격
        let dmg = player.attack(monster);
        logs.push(chalk.greenBright(`${dmg}의 피해를 입혔습니다.`));
        break;
      case '2': // 랜덤 조건 충족시 피해를 입지않고 공격, 실패시 플레이어만 피해입음
        console.log(chalk.white('반격을 시도합니다.'));
        await sleep(1000);
        if (randomRoll(100) < player.counter) {
          counter = true;
          logs.push(chalk.cyanBright(`적의 공격을 파훼하고 반격합니다.`));
          let dmg = player.attack(monster);
          logs.push(chalk.greenBright(`${dmg}의 피해를 입혔습니다.`));
        }
        else {
          logs.push(chalk.redBright(`적의 공격을 간파하지 못했습니다.`));
        }
        break;
      case '3': // 도망 시도
        console.log(chalk.grey('몬스터를 따돌리는 중 입니다.'));
        await sleep(1000);
        escape = true;
        break;
      case '6':
        console.log(chalk.red('게임을 종료합니다.'));
        process.exit(0); // 게임 종료
      default:
        continue;
    }

    if (monster.hp > 0 && !escape && !counter) {
      // 전투 지속 - 몬스터 턴
      let dmg = monster.attack(player);
      logs.push(chalk.redBright(`${dmg}의 피해를 입었습니다.`));
    }
  }  
};

// 보상
function reward(player, logs) {  
  // 전체 보상 배열 길이 * Math.random() , 소수점 버림 => 보상 인덱스 번호
  let dice = Math.floor(randomRoll(rewardstable.length - 1));
  if (dice > rewardstable.length - 1) {
    console.log(chalk.red('보상 랜덤 오류'));
    return;
  }
  else {
    // 보상 객체가 가진 속성들을 용도에 맞게 적용
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
// 난수 반환 함수
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
    if(player.hp <= 0){
      GameOver();
      break;
    }
    stage++;
    if(stage > 10)
      GameClear();
  }
  
}

async function GameOver() {
  console.clear();
  console.log(
    chalk.red(
      figlet.textSync('GAME OVER', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.gray(`게임 오버 입니다. 아무거나 입력하면 로비로 돌아갑니다.`));

  do {
    const clicktonext = readlineSync.question();
    switch (clicktonext) {
      default:
        break;
    }
  } while (false);
  start();
}

async function GameClear() {
  console.clear();
  console.log(
    chalk.blueBright(
      figlet.textSync('GAME CLEAR', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.gray(`게임을 클리어 하셨습니다. 아무거나 입력하면 로비로 돌아갑니다.`));

  do {
    const clicktonext = readlineSync.question();
    switch (clicktonext) {
      default:
        break;
    }
  } while (false);
  start();
}