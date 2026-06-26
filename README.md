# TokenAcorn

AI 模型价格对比与管理平台

## 功能特性

- 支持多厂商 AI 模型价格对比
- 实时汇率转换（USD/CNY）
- 后端管理界面
- 支持 SQLite / MySQL / PostgreSQL 数据库

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd token-acorn
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并根据需要修改：

```bash
# 数据库配置（默认 SQLite）
DATABASE_URL="file:./data/models.db"

# 管理员密码
ADMIN_PASSWORD="admin123"
```

### 4. 初始化数据库

```bash
# 推送数据库结构
npm run db:push

# 生成 Prisma Client
npx prisma generate

# 导入初始数据（可选）
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:push` | 推送数据库结构变更 |
| `npm run db:seed` | 导入初始数据 |
| `npm run db:studio` | 打开 Prisma Studio 数据库管理界面 |

## 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Prisma + SQLite (可切换 MySQL/PostgreSQL)
- **国际化**: next-intl

## 数据库切换

编辑 `prisma/schema.prisma` 修改数据源：

```prisma
datasource db {
  provider = "sqlite"  // 改为 "mysql" 或 "postgresql"
}
```

然后更新 `.env` 中的 `DATABASE_URL` 为对应数据库连接字符串。

## 项目结构

```
token-acorn/
├── app/              # Next.js 应用页面
├── lib/              # 工具函数和数据库客户端
├── prisma/           # 数据库 schema 和 seed 脚本
├── components/       # React 组件
├── public/           # 静态资源
├── data/             # SQLite 数据库文件
└── messages/         # 国际化翻译文件
```

## 许可证

MIT
