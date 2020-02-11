# A3:使用者權限管理

學期 4 A3:使用者權限管理

## 功能列表

- 使用者可以 email 和自訂密碼註冊、登入
- 註冊、登入皆有操作成功訊息和操作失敗提示
- 將使用者權限分為 user(一般使用者) 和 admin(管理者) 兩種類型
- 具有 user 權限之帳號登入，不顯示後台入口 ; 具有 admin 權限之帳號登入，於 navbar 出現『 Admin 後台 』入口連結
- 點擊『 Admin 後台 』連結即進入後台首頁，預設顯示 Restaurant 列表，並於分頁標籤以綠底醒目提示當前頁面
- 點擊 New Restaurant 出現新增餐廳資訊之表單，可選擇是否上傳圖檔，點擊 Submit 完成編輯
- 點擊各 Restaurant 之 show 連結可查看餐廳資訊 ; 點擊 edit 連結可修改餐廳資訊 ; 點擊 delete 連結可刪除該餐廳
- 點擊 Users 分頁即顯示 User 列表，當前頁面之醒目提示隨之切換
- User 列表顯示各 User 之 email、Role 及權限切換連結，但當前登入之 User 則只顯示 email 和 Role ，避免誤按而失去 admin 權限
- 點擊權限切換連結可即時切換『 權限類型 』和『 權限切換連結 』，切換成功於畫面上方出現操作成功訊息

## 環境建置

1. MySQL v8.0.18
2. Node.js

## 專案安裝流程

1. 開啟 terminal，將此專案 clone 至本機

```
git clone https://github.com/StephHan232430/S4A3_forum_express.git
```

2. 進入專案資料夾

```
cd S4A3_forum_express
```

3. 安裝專案所需套件

```
npm install
```

4. 至 Imgur 網站註冊並取得 Client ID

5. 以程式碼編輯器開啟專案後，於根目錄新增.env 檔，並依以下格式將剛取得之 Client ID 填入

```
// .env

IMGUR_CLIENT_ID=${剛取得之Client ID}
```

6. 於 MySQL Workbench 介面的 query tab 輸入以下指令

```
drop database if exists forum;
create database forum;
use forum;
```

7. 於 terminal 輸入下方指令，建立資料庫 schema

```
npx sequelize db:migrate
```

8. 於 terminal 輸入下方指令匯入種子資料

```
npx sequelize db:seed:all
```

9. 修改 config.json

```
"development": {
  "username": "root",
  "password": "${安裝MySQL時設定之password}",
  "database": "forum",
  "host": "127.0.0.1",
  "dialect": "mysql"
}
```

10. 執行專案

```

npm run dev

```

11. 開啟網頁瀏覽器，於網址列輸入

```

http://localhost:3000

```

## 專案部署

[https://shrouded-tor-37170.herokuapp.com](https://shrouded-tor-37170.herokuapp.com)

## 測試帳號

| Name  |       Email       | Password | Default Role | ㄒ  |
| :---: | :---------------: | :------: | :----------: | --- |
| root  | root@example.com  | 12345678 |    admin     |
| user1 | user1@example.com | 12345678 |     user     |
| user2 | user2@example.com | 12345678 |     user     |

## 使用工具

- [bcryptjs v2.4.3](https://www.npmjs.com/package/bcryptjs)
- [body-parser v1.19.0](https://www.npmjs.com/package/body-parser)
- [connect-flash v0.1.1](https://www.npmjs.com/package/connect-flash)
- [dotenv v8.2.0](https://www.npmjs.com/package/dotenv)
- [express v4.17.1](https://expressjs.com/zh-tw/)
- [express-Handlebars v3.1.0](https://github.com/ericf/express-handlebars)
- [express-session v1.17.0](https://www.npmjs.com/package/express-session)
- [faker v4.1.0](https://www.npmjs.com/package/faker)
- [imgur-node-api v0.1.0](https://www.npmjs.com/package/imgur-node-api)
- [method-override v3.0.0](https://www.npmjs.com/package/method-override)
- [multer v1.4.2](https://www.npmjs.com/package/multer)
- [MySQL v8.0.18](https://dev.mysql.com/downloads/mysql/)
- [mysql2 v2.0.2](https://www.npmjs.com/package/mysql2)
- [MySQL Workbench 8.0.18](https://dev.mysql.com/downloads/workbench/)
- [Node.js v12.13.0](https://nodejs.org/en/)
- [passport v0.4.0](https://www.npmjs.com/package/passport)
- [passport-local v1.0.0](https://www.npmjs.com/package/passport-local)
- [pg v7.18.1](https://www.npmjs.com/package/pg)
- [sequelize v5.21.2](https://www.npmjs.com/package/sequelize)
- [sequelize-cli v5.5.1](https://www.npmjs.com/package/sequelize-cli)
- [Visual Studio Code v1.39.2](https://code.visualstudio.com/)
