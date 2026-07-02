# TokenAcorn 后台管理 API 文档

本文档描述 TokenAcorn 后台管理接口，支持模型的增删改查、厂商管理、推荐模型设置等操作。

---

## 认证方式

所有 Admin API（除登录外）均通过 `Cookie: admin_session=...` 进行认证。登录成功后服务端会自动设置 Cookie，后续请求携带该 Cookie 即可。

- **Cookie 名称**: `admin_session`
- **有效期**: 24 小时
- **环境变量**: `ADMIN_PASSWORD`（在 `.env` 中配置）

### 登录 / 登出

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/admin/auth/login` | 登录，获取 session cookie |
| `POST` | `/api/admin/auth/logout` | 登出，清除 session cookie |

#### 登录示例

**请求：**
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "your-admin-password"}' \
  -c cookies.txt
```

**响应：**
```json
{
  "success": true
}
```

> 使用 `-c cookies.txt` 保存 cookie，后续请求用 `-b cookies.txt` 携带。

---

## Python 通用调用方式

使用 `requests.Session()` 自动管理 Cookie：

```python
import requests

BASE_URL = "http://localhost:3000"  # 根据实际部署地址修改
ADMIN_PASSWORD = "your-admin-password"

session = requests.Session()

# 1. 登录
resp = session.post(
    f"{BASE_URL}/api/admin/auth/login",
    json={"password": ADMIN_PASSWORD}
)
resp.raise_for_status()
print("登录成功:", resp.json())

# 2. 后续请求自动携带 cookie
# resp = session.get(f"{BASE_URL}/api/admin/models")
```

---

## 1. 模型管理

### 1.1 列出所有模型

| 属性 | 值 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/admin/models` |
| 查询参数 | `providerId`（可选）按厂商筛选 |

**请求：**
```bash
curl -X GET "http://localhost:3000/api/admin/models" \
  -b cookies.txt
```

**响应（200）：**
```json
[
  {
    "id": "gpt-4o",
    "name": "GPT-4o",
    "providerId": "openai",
    "category": "general",
    "contextWindow": 128000,
    "maxOutput": 4096,
    "cacheRate": 90,
    "deprecated": false,
    "releaseDate": "2024-05-13",
    "knowledgeCutoff": "2023-12-01",
    "notes": "多模态旗舰模型",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-06-01T00:00:00.000Z",
    "provider": {
      "id": "openai",
      "name": "OpenAI",
      "website": "https://openai.com",
      "logoFormat": "svg"
    },
    "capabilities": [
      { "modelId": "gpt-4o", "capability": "text" },
      { "modelId": "gpt-4o", "capability": "vision" },
      { "modelId": "gpt-4o", "capability": "code" },
      { "modelId": "gpt-4o", "capability": "function-call" }
    ],
    "pricingItems": [
      {
        "id": 1,
        "modelId": "gpt-4o",
        "pricingType": "token_input",
        "tier": "standard",
        "price": 5.0,
        "unit": "per_million",
        "conditions": null
      },
      {
        "id": 2,
        "modelId": "gpt-4o",
        "pricingType": "token_output",
        "tier": "standard",
        "price": 15.0,
        "unit": "per_million",
        "conditions": null
      }
    ],
    "featured": null
  }
]
```

**Python 示例：**
```python
resp = session.get(f"{BASE_URL}/api/admin/models")
resp.raise_for_status()
models = resp.json()
print(f"共 {len(models)} 个模型")

# 按厂商筛选
resp = session.get(f"{BASE_URL}/api/admin/models", params={"providerId": "openai"})
openai_models = resp.json()
```

---

### 1.2 创建模型

| 属性 | 值 |
|------|------|
| 方法 | `POST` |
| 路径 | `/api/admin/models` |
| 请求体 | JSON |

**请求字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 模型唯一标识，如 `gpt-4o` |
| `name` | `string` | 是 | 模型显示名称 |
| `providerId` | `string` | 是 | 所属厂商 ID |
| `category` | `string` | 否 | 类别：`general`, `llm`, `embedding`, `image`, `video`, `audio`, `moderation`（默认 `general`） |
| `contextWindow` | `number/string` | 否 | 上下文窗口大小 |
| `maxOutput` | `number/string` | 否 | 最大输出 token 数 |
| `cacheRate` | `number/string` | 否 | 缓存率百分比（0-100），如 `90` 表示 90% |
| `deprecated` | `boolean` | 否 | 是否已废弃（默认 `false`） |
| `releaseDate` | `string` | 否 | 发布日期，如 `2024-05-13` |
| `knowledgeCutoff` | `string` | 否 | 知识截止日期，如 `2023-12-01` |
| `notes` | `string` | 否 | 备注 |
| `capabilities` | `string[]` | 否 | 能力标签数组，如 `["text", "vision", "code"]` |
| `pricingItems` | `object[]` | 否 | 价格条目数组 |

**pricingItems 字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pricingType` | `string` | 是 | 计费方式：`token_input`, `token_output`, `token_cached`, `per_image`, `per_second`, `per_minute`, `per_character` |
| `tier` | `string` | 否 | 分级：`standard`, `hd`, `4k`, `720p`, `1080p`, `1024x1024` 等（默认 `standard`） |
| `price` | `number` | 是 | 价格数值 |
| `unit` | `string` | 否 | 单位：`per_million`, `per_unit`, `per_second`, `per_minute`（默认 `per_million`） |
| `conditions` | `string` | 否 | 额外条件的 JSON 字符串 |

**请求：**
```bash
curl -X POST "http://localhost:3000/api/admin/models" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "id": "claude-3-5-sonnet",
    "name": "Claude 3.5 Sonnet",
    "providerId": "anthropic",
    "category": "general",
    "contextWindow": 200000,
    "maxOutput": 4096,
    "cacheRate": 90,
    "deprecated": false,
    "releaseDate": "2024-06-20",
    "knowledgeCutoff": "2024-04-01",
    "notes": "高性价比推理模型",
    "capabilities": ["text", "vision", "code", "function-call"],
    "pricingItems": [
      {
        "pricingType": "token_input",
        "tier": "standard",
        "price": 3.0,
        "unit": "per_million"
      },
      {
        "pricingType": "token_output",
        "tier": "standard",
        "price": 15.0,
        "unit": "per_million"
      }
    ]
  }'
```

**响应（201）：**
```json
{
  "id": "claude-3-5-sonnet",
  "name": "Claude 3.5 Sonnet",
  "providerId": "anthropic",
  "category": "general",
  "contextWindow": 200000,
  "maxOutput": 4096,
  "cacheRate": 90,
  "deprecated": false,
  "releaseDate": "2024-06-20",
  "knowledgeCutoff": "2024-04-01",
  "notes": "高性价比推理模型",
  "createdAt": "2024-06-10T07:30:00.000Z",
  "updatedAt": "2024-06-10T07:30:00.000Z"
}
```

**Python 示例：**
```python
new_model = {
    "id": "claude-3-5-sonnet",
    "name": "Claude 3.5 Sonnet",
    "providerId": "anthropic",
    "category": "general",
    "contextWindow": 200000,
    "maxOutput": 4096,
    "cacheRate": 90,
    "deprecated": False,
    "releaseDate": "2024-06-20",
    "knowledgeCutoff": "2024-04-01",
    "notes": "高性价比推理模型",
    "capabilities": ["text", "vision", "code", "function-call"],
    "pricingItems": [
        {"pricingType": "token_input", "tier": "standard", "price": 3.0, "unit": "per_million"},
        {"pricingType": "token_output", "tier": "standard", "price": 15.0, "unit": "per_million"},
    ],
}

resp = session.post(f"{BASE_URL}/api/admin/models", json=new_model)
resp.raise_for_status()
print("创建成功:", resp.json())
```

---

### 1.3 获取单个模型

| 属性 | 值 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/admin/models/{id}` |

**请求：**
```bash
curl -X GET "http://localhost:3000/api/admin/models/claude-3-5-sonnet" \
  -b cookies.txt
```

**响应（200）：**
```json
{
  "id": "claude-3-5-sonnet",
  "name": "Claude 3.5 Sonnet",
  ...
}
```

**Python 示例：**
```python
model_id = "claude-3-5-sonnet"
resp = session.get(f"{BASE_URL}/api/admin/models/{model_id}")
resp.raise_for_status()
model = resp.json()
print(model["name"], model["pricingItems"])
```

---

### 1.4 更新模型

| 属性 | 值 |
|------|------|
| 方法 | `PUT` |
| 路径 | `/api/admin/models/{id}` |
| 请求体 | JSON（字段与创建时相同） |

> **注意**：`capabilities` 和 `pricingItems` 采用**全量替换**策略。如果传入空数组，会清空对应数据。修改价格时，系统会自动检测价格变化并记录到 `priceHistory` 表。

**请求：**
```bash
curl -X PUT "http://localhost:3000/api/admin/models/claude-3-5-sonnet" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Claude 3.5 Sonnet (Updated)",
    "providerId": "anthropic",
    "category": "general",
    "contextWindow": 200000,
    "maxOutput": 8192,
    "cacheRate": 92,
    "deprecated": false,
    "releaseDate": "2024-06-20",
    "knowledgeCutoff": "2024-04-01",
    "notes": "上下文窗口扩展",
    "capabilities": ["text", "vision", "code", "function-call", "image-gen"],
    "pricingItems": [
      {
        "pricingType": "token_input",
        "tier": "standard",
        "price": 3.0,
        "unit": "per_million"
      },
      {
        "pricingType": "token_output",
        "tier": "standard",
        "price": 15.0,
        "unit": "per_million"
      },
      {
        "pricingType": "token_cached",
        "tier": "standard",
        "price": 0.75,
        "unit": "per_million"
      }
    ]
  }'
```

**响应（200）：**
```json
{
  "id": "claude-3-5-sonnet",
  "name": "Claude 3.5 Sonnet (Updated)",
  "providerId": "anthropic",
  "category": "general",
  "contextWindow": 200000,
  "maxOutput": 8192,
  "cacheRate": 92,
  "deprecated": false,
  "releaseDate": "2024-06-20",
  "knowledgeCutoff": "2024-04-01",
  "notes": "上下文窗口扩展",
  "updatedAt": "2024-06-10T08:00:00.000Z"
}
```

**Python 示例：**
```python
model_id = "claude-3-5-sonnet"

updates = {
    "name": "Claude 3.5 Sonnet (Updated)",
    "providerId": "anthropic",
    "category": "general",
    "contextWindow": 200000,
    "maxOutput": 8192,
    "cacheRate": 92,
    "deprecated": False,
    "releaseDate": "2024-06-20",
    "knowledgeCutoff": "2024-04-01",
    "notes": "上下文窗口扩展",
    "capabilities": ["text", "vision", "code", "function-call", "image-gen"],
    "pricingItems": [
        {"pricingType": "token_input", "tier": "standard", "price": 3.0, "unit": "per_million"},
        {"pricingType": "token_output", "tier": "standard", "price": 15.0, "unit": "per_million"},
        {"pricingType": "token_cached", "tier": "standard", "price": 0.75, "unit": "per_million"},
    ],
}

resp = session.put(f"{BASE_URL}/api/admin/models/{model_id}", json=updates)
resp.raise_for_status()
print("更新成功:", resp.json())
```

---

### 1.5 删除模型

| 属性 | 值 |
|------|------|
| 方法 | `DELETE` |
| 路径 | `/api/admin/models/{id}` |

**请求：**
```bash
curl -X DELETE "http://localhost:3000/api/admin/models/claude-3-5-sonnet" \
  -b cookies.txt
```

**响应（200）：**
```json
{
  "success": true
}
```

**Python 示例：**
```python
model_id = "claude-3-5-sonnet"
resp = session.delete(f"{BASE_URL}/api/admin/models/{model_id}")
resp.raise_for_status()
print("删除成功:", resp.json())
```

---

## 2. 厂商管理

### 2.1 列出所有厂商

| 属性 | 值 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/admin/providers` |

**请求：**
```bash
curl -X GET "http://localhost:3000/api/admin/providers" \
  -b cookies.txt
```

**响应（200）：**
```json
[
  {
    "id": "openai",
    "name": "OpenAI",
    "website": "https://openai.com",
    "logoFormat": "svg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "models": 5
    }
  }
]
```

**Python 示例：**
```python
resp = session.get(f"{BASE_URL}/api/admin/providers")
resp.raise_for_status()
providers = resp.json()
for p in providers:
    print(f"{p['name']}: {p['_count']['models']} 个模型")
```

---

### 2.2 创建厂商

| 属性 | 值 |
|------|------|
| 方法 | `POST` |
| 路径 | `/api/admin/providers` |
| 请求体 | JSON |

**请求字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 厂商唯一标识，如 `anthropic` |
| `name` | `string` | 是 | 厂商显示名称 |
| `website` | `string` | 否 | 官网地址 |
| `logoFormat` | `string` | 否 | Logo 格式，如 `svg`, `png` |

**请求：**
```bash
curl -X POST "http://localhost:3000/api/admin/providers" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "id": "anthropic",
    "name": "Anthropic",
    "website": "https://www.anthropic.com",
    "logoFormat": "svg"
  }'
```

**响应（201）：**
```json
{
  "id": "anthropic",
  "name": "Anthropic",
  "website": "https://www.anthropic.com",
  "logoFormat": "svg",
  "createdAt": "2024-06-10T07:30:00.000Z",
  "updatedAt": "2024-06-10T07:30:00.000Z"
}
```

**Python 示例：**
```python
new_provider = {
    "id": "anthropic",
    "name": "Anthropic",
    "website": "https://www.anthropic.com",
    "logoFormat": "svg",
}

resp = session.post(f"{BASE_URL}/api/admin/providers", json=new_provider)
resp.raise_for_status()
print("创建成功:", resp.json())
```

---

### 2.3 更新厂商

| 属性 | 值 |
|------|------|
| 方法 | `PUT` |
| 路径 | `/api/admin/providers/{id}` |

**请求：**
```bash
curl -X PUT "http://localhost:3000/api/admin/providers/anthropic" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Anthropic Inc.",
    "website": "https://www.anthropic.com",
    "logoFormat": "png"
  }'
```

**响应（200）：**
```json
{
  "id": "anthropic",
  "name": "Anthropic Inc.",
  "website": "https://www.anthropic.com",
  "logoFormat": "png",
  "updatedAt": "2024-06-10T08:00:00.000Z"
}
```

**Python 示例：**
```python
provider_id = "anthropic"
updates = {
    "name": "Anthropic Inc.",
    "website": "https://www.anthropic.com",
    "logoFormat": "png",
}

resp = session.put(f"{BASE_URL}/api/admin/providers/{provider_id}", json=updates)
resp.raise_for_status()
print("更新成功:", resp.json())
```

---

### 2.4 删除厂商

| 属性 | 值 |
|------|------|
| 方法 | `DELETE` |
| 路径 | `/api/admin/providers/{id}` |

> **注意**：删除厂商会级联删除其下的所有模型、价格、能力等数据，请谨慎操作。

**请求：**
```bash
curl -X DELETE "http://localhost:3000/api/admin/providers/anthropic" \
  -b cookies.txt
```

**响应（200）：**
```json
{
  "success": true
}
```

**Python 示例：**
```python
provider_id = "anthropic"
resp = session.delete(f"{BASE_URL}/api/admin/providers/{provider_id}")
resp.raise_for_status()
print("删除成功:", resp.json())
```

---

## 3. 推荐模型管理

### 3.1 获取推荐模型列表

| 属性 | 值 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/admin/featured` |

**请求：**
```bash
curl -X GET "http://localhost:3000/api/admin/featured" \
  -b cookies.txt
```

**响应（200）：**
```json
[
  {
    "modelId": "gpt-4o",
    "sortOrder": 0,
    "model": {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": {
        "id": "openai",
        "name": "OpenAI"
      }
    }
  },
  {
    "modelId": "claude-3-5-sonnet",
    "sortOrder": 1,
    "model": {
      "id": "claude-3-5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "provider": {
        "id": "anthropic",
        "name": "Anthropic"
      }
    }
  }
]
```

**Python 示例：**
```python
resp = session.get(f"{BASE_URL}/api/admin/featured")
resp.raise_for_status()
featured = resp.json()
for f in featured:
    print(f"#{f['sortOrder']} {f['model']['name']} ({f['model']['provider']['name']})")
```

---

### 3.2 设置推荐模型

| 属性 | 值 |
|------|------|
| 方法 | `PUT` |
| 路径 | `/api/admin/featured` |
| 请求体 | JSON |

> **注意**：采用**全量替换**策略。传入的 `modelIds` 数组顺序即为展示顺序。

**请求字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `modelIds` | `string[]` | 是 | 模型 ID 数组，按展示顺序排列 |

**请求：**
```bash
curl -X PUT "http://localhost:3000/api/admin/featured" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "modelIds": ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"]
  }'
```

**响应（200）：**
```json
{
  "success": true
}
```

**Python 示例：**
```python
resp = session.put(
    f"{BASE_URL}/api/admin/featured",
    json={"modelIds": ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"]}
)
resp.raise_for_status()
print("设置成功:", resp.json())
```

---

## 4. 完整 Python 脚本示例

```python
"""
TokenAcorn Admin API Python 调用示例
完整流程：登录 -> 创建厂商 -> 创建模型 -> 更新模型 -> 设为推荐 -> 登出
"""

import requests

BASE_URL = "http://localhost:3000"
ADMIN_PASSWORD = "your-admin-password"


def main():
    session = requests.Session()

    # 1. 登录
    print("=== 登录 ===")
    resp = session.post(
        f"{BASE_URL}/api/admin/auth/login",
        json={"password": ADMIN_PASSWORD}
    )
    resp.raise_for_status()
    print(resp.json())

    # 2. 创建厂商（如果不存在）
    print("\n=== 创建厂商 ===")
    provider = {
        "id": "deepseek",
        "name": "DeepSeek",
        "website": "https://www.deepseek.com",
        "logoFormat": "svg",
    }
    resp = session.post(f"{BASE_URL}/api/admin/providers", json=provider)
    if resp.status_code == 400 and "already exists" in resp.text:
        print("厂商已存在，跳过创建")
    else:
        resp.raise_for_status()
        print(resp.json())

    # 3. 创建模型
    print("\n=== 创建模型 ===")
    model = {
        "id": "deepseek-v3",
        "name": "DeepSeek V3",
        "providerId": "deepseek",
        "category": "general",
        "contextWindow": 64000,
        "maxOutput": 8192,
        "cacheRate": 95,
        "deprecated": False,
        "releaseDate": "2024-12-26",
        "knowledgeCutoff": "2024-07-01",
        "notes": "国产开源大模型，性能优异",
        "capabilities": ["text", "code", "function-call"],
        "pricingItems": [
            {"pricingType": "token_input", "tier": "standard", "price": 0.14, "unit": "per_million"},
            {"pricingType": "token_output", "tier": "standard", "price": 0.28, "unit": "per_million"},
            {"pricingType": "token_cached", "tier": "standard", "price": 0.07, "unit": "per_million"},
        ],
    }
    resp = session.post(f"{BASE_URL}/api/admin/models", json=model)
    if resp.status_code == 400 and "already exists" in resp.text:
        print("模型已存在，跳过创建")
    else:
        resp.raise_for_status()
        print(resp.json())

    # 4. 更新模型价格
    print("\n=== 更新模型价格 ===")
    updates = {
        **model,
        "pricingItems": [
            {"pricingType": "token_input", "tier": "standard", "price": 0.10, "unit": "per_million"},
            {"pricingType": "token_output", "tier": "standard", "price": 0.20, "unit": "per_million"},
            {"pricingType": "token_cached", "tier": "standard", "price": 0.05, "unit": "per_million"},
        ],
    }
    resp = session.put(f"{BASE_URL}/api/admin/models/deepseek-v3", json=updates)
    resp.raise_for_status()
    print("价格更新成功，变更已记录到 priceHistory")

    # 5. 设为推荐模型
    print("\n=== 设置推荐模型 ===")
    resp = session.put(
        f"{BASE_URL}/api/admin/featured",
        json={"modelIds": ["deepseek-v3", "gpt-4o"]}
    )
    resp.raise_for_status()
    print(resp.json())

    # 6. 列出所有模型确认
    print("\n=== 列出所有模型 ===")
    resp = session.get(f"{BASE_URL}/api/admin/models")
    resp.raise_for_status()
    models = resp.json()
    for m in models:
        print(f"- {m['name']} ({m['provider']['name']}): {len(m['pricingItems'])} 个价格条目")

    # 7. 登出
    print("\n=== 登出 ===")
    resp = session.post(f"{BASE_URL}/api/admin/auth/logout")
    print("登出完成")


if __name__ == "__main__":
    main()
```

---

## 5. 错误码说明

| 状态码 | 含义 |
|--------|------|
| `200` | 成功 |
| `201` | 创建成功 |
| `400` | 请求参数错误（如缺少必填字段、ID 已存在） |
| `401` | 未认证（未登录或 session 过期） |
| `404` | 资源不存在 |
| `500` | 服务器内部错误 |

---

## 6. 数据字典

### cacheRate（缓存率）
- 取值范围：`0` - `100`（百分比）
- 表示模型的 Prompt 缓存命中率
- 例如：`90` 表示 90% 的缓存命中率

### category（模型类别）
- `general` — 通用大模型
- `llm` — 大语言模型
- `embedding` — 嵌入模型
- `image` — 图像模型
- `video` — 视频模型
- `audio` — 音频模型
- `moderation` — 内容审核

### capability（能力标签）
常用值：`text`, `vision`, `image-gen`, `video-gen`, `code`, `function-call`, `audio`, `embedding`, `rerank`

### pricingType（计费方式）
- `token_input` — 输入 token
- `token_output` — 输出 token
- `token_cached` — 缓存 token
- `per_image` — 按张计费（图像生成）
- `per_second` — 按秒计费
- `per_minute` — 按分钟计费
- `per_character` — 按字符计费

### tier（分级）
- `standard` — 标准版（默认）
- `hd` — 高清版
- `4k` — 4K 版
- `720p`, `1080p` — 视频分辨率
- `1024x1024`, `512x512` — 图像尺寸

### unit（价格单位）
- `per_million` — 每百万（默认，适用于 token 计费）
- `per_unit` — 每单位
- `per_second` — 每秒
- `per_minute` — 每分钟

---

## 9. LM Arena 排行榜导入

### 9.1 导入排行榜数据

| 属性 | 值 |
|------|------|
| 方法 | `POST` |
| 路径 | `/api/admin/lmarena/import` |
| 请求体 | JSON，结构与 `lmarena_leaderboard.json` 相同 |
| 认证 | 需要 `admin_session` Cookie |

**请求体字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fetch_time` | `string` | 否 | 数据抓取时间，ISO 8601 格式 |
| `source_url` | `string` | 否 | 数据来源地址 |
| `title` | `string` | 否 | 排行榜总标题 |
| `leaderboards` | `object` | 是 | 各维度排行榜，key 为榜单标识，value 为条目数组 |

**leaderboards 中每个条目的字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `rank` | `number` | 排名 |
| `model_key` | `string \| null` | 模型 key |
| `model_name` | `string` | 模型显示名称 |
| `rating` | `number` | 评分 / Elo 分数 |
| `votes` | `number` | 投票数 |
| `organization` | `string` | 所属机构 |
| `license` | `string \| null` | 许可证类型 |
| `input_price_per_million` | `number \| null` | 输入价格（每百万 token） |
| `output_price_per_million` | `number \| null` | 输出价格（每百万 token） |
| `context_length` | `number \| null` | 上下文长度 |

**请求示例：**

```bash
curl -X POST "http://localhost:3000/api/admin/lmarena/import" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d @lmarena_leaderboard.json
```

**响应（200）：**

```json
{
  "success": true,
  "fetchedAt": "2026-06-29T03:29:25.764Z",
  "leaderboards": [
    { "key": "agent", "title": "LM Arena Leaderboard - agent", "count": 28 },
    { "key": "text", "title": "LM Arena Leaderboard - text", "count": 200 },
    { "key": "code", "title": "LM Arena Leaderboard - code", "count": 90 }
  ]
}
```

> 导入时会按 `key` 自动创建或更新 `LmArenaLeaderboard`，并清空该榜旧条目后重新写入。

### 9.2 查询排行榜数据

| 属性 | 值 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/lmarena` |
| 查询参数 | `key`（可选，按榜单标识筛选）、`category`（可选，按类别筛选） |
| 认证 | 不需要 |

**请求示例：**

```bash
# 查询所有排行榜
curl "http://localhost:3000/api/lmarena"

# 查询指定榜单
curl "http://localhost:3000/api/lmarena?key=agent"

# 按类别查询
curl "http://localhost:3000/api/lmarena?category=llm"
```

**响应（200）：**

```json
[
  {
    "id": "...",
    "key": "agent",
    "title": "LM Arena Leaderboard - agent",
    "description": "Source: https://arena.ai/leaderboard",
    "category": "llm",
    "sourceUrl": "https://arena.ai/leaderboard",
    "fetchedAt": "2026-06-29T03:29:25.764Z",
    "entries": [
      {
        "id": "...",
        "rank": 1,
        "modelKey": null,
        "modelName": "Claude Fable 5 (High)",
        "rating": 0.14000340089667881,
        "votes": 16082,
        "organization": "Anthropic",
        "license": "Proprietary",
        "inputPrice": null,
        "outputPrice": null,
        "contextLength": null
      }
    ]
  }
]
```

### 9.3 Python 示例

```python
import json
import requests

BASE_URL = "http://localhost:3000"
ADMIN_PASSWORD = "your-admin-password"

session = requests.Session()

# 1. 登录
resp = session.post(
    f"{BASE_URL}/api/admin/auth/login",
    json={"password": ADMIN_PASSWORD}
)
resp.raise_for_status()

# 2. 读取本地 JSON 并导入
with open("lmarena_leaderboard.json", "r", encoding="utf-8") as f:
    payload = json.load(f)

resp = session.post(
    f"{BASE_URL}/api/admin/lmarena/import",
    json=payload
)
resp.raise_for_status()
print("导入结果:", resp.json())

# 3. 查询公开接口
resp = session.get(f"{BASE_URL}/api/lmarena?key=agent")
resp.raise_for_status()
agent_board = resp.json()[0]
print(f"{agent_board['title']} 共 {len(agent_board['entries'])} 条")
```
