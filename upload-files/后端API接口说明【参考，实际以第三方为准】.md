# 后端 API 接口说明

> 本文档为接口定义参考，实际接口以第三方提供为准！

---

## API 接口列表

### 1. 文件上传 —— 获取上传凭证/直传

| 项目 | 内容 |
|------|------|
| **接口名** | `POST /api/files/upload` |
| **用途** | 接收前端选择的图片文件，存储到后端文件系统/OSS，返回可访问的 URL 和缩略图 URL |
| **请求参数** | `multipart/form-data`：`file` (图片文件，jpg/jpeg/png) |
| **响应** | `{ url: string, thumb_url: string, storage_key: string, file_size: number }` |
| **说明** | 单文件上传，前端逐个调用。成功后返回图片 URL 供前端预览和提交记录时引用。也可以改造为支持多文件批量上传 |

### 2. 提交上传记录

| 项目 | 内容 |
|------|------|
| **接口名** | `POST /api/records` |
| **用途** | 创建一个新的上传记录（含一组图片文件），将小程序/移动端提交的全部数据落库 |
| **请求参数（JSON）** | `{ type: string, type_name: string, business_date: string, description: string, files: [{ storage_key: string, filename: string, custom_name: string, file_size: number }] }` |
| **响应** | `{ record_id: number }` |
| **说明** | `business_date` 由前端日期选择器提供；`uploader` 和 `upload_time` 由后端根据当前登录用户和服务器时间自动填充 |

### 3. 查询上传记录列表（图片画廊）

| 项目 | 内容 |
|------|------|
| **接口名** | `GET /api/records` |
| **用途** | PC端画廊页面加载图片卡片列表，支持多条件筛选、排序、分页 |
| **请求参数** | `?type=&start_date=&end_date=&uploader=&keyword=&sort_field=&sort_dir=&page=&page_size=` |
| | - `type`: 资料类型 key，`all` 表示全部 |
| | - `start_date` / `end_date`: 上传日期范围 |
| | - `uploader`: 上传人筛选 |
| | - `keyword`: 图片名称模糊搜索（匹配 custom_name 和 filename） |
| | - `sort_field`: `upload_time` / `name` / `modified_at` |
| | - `sort_dir`: `asc` / `desc` |
| | - `page`: 页码（默认1） |
| | - `page_size`: 每页条数（默认20） |
| **响应** | `{ total: number, list: [{ record_id, file_index, thumb_url, type, type_name, display_name, custom_name, uploader, upload_time, modified_at, modified_by }], has_more: boolean }` |
| **说明** | 这是最核心的查询接口。返回的是**图片级别**的列表（一条记录包含多张图片时每条图片各占一行），供前端画廊网格渲染。`display_name` = custom_name 或 filename 的兜底值 |

### 4. 获取单张图片详情

| 项目 | 内容 |
|------|------|
| **接口名** | `GET /api/records/:record_id/files/:file_index` |
| **用途** | 点击画廊卡片打开详情弹窗，展示大图及元数据信息 |
| **请求参数** | URL Path 参数 |
| **响应** | `{ thumb_url, original_url, type, type_name, custom_name, upload_time, uploader, modified_at, modified_by }` |
| **说明** | 亦可简化设计为直接返回完整的 `Record` 对象 + `file_index`，由前端自行索引对应文件 |

### 5. 更新单张图片元数据

| 项目 | 内容 |
|------|------|
| **接口名** | `PATCH /api/records/:record_id/files/:file_index` |
| **用途** | 在详情弹窗中修改图片的资料类型和自定义命名 |
| **请求参数（JSON）** | `{ type: string, type_name: string, custom_name: string }` |
| **响应** | `{ success: true }` |
| **说明** | `modified_at` 和 `modified_by` 由后端自动更新 |

### 6. 删除单张图片

| 项目 | 内容 |
|------|------|
| **接口名** | `DELETE /api/records/:record_id/files/:file_index` |
| **用途** | 删除记录中的某一张图片；如果记录下所有图片都被删完，则自动删除整条记录 |
| **请求参数** | URL Path 参数 |
| **响应** | `{ success: true, record_deleted: boolean }` |
| **说明** | 删除图片的同时建议同步删除存储中的原文件（或标记为待清理） |

### 7. 编辑整条上传记录

| 项目 | 内容 |
|------|------|
| **接口名** | `PUT /api/records/:record_id` |
| **用途** | PC端编辑弹窗：修改记录的资料类型、经营日期、备注描述，以及替换/增减文件 |
| **请求参数（JSON）** | `{ type: string, type_name: string, business_date: string, description: string, files: [{ storage_key, filename, file_size }] }` |
| **响应** | `{ success: true }` |
| **说明** | `files` 是最终文件列表（全量替换）。后端需对比新旧列表，清理被移除的存储文件 |

### 8. 获取自定义标签列表

| 项目 | 内容 |
|------|------|
| **接口名** | `GET /api/custom-types` |
| **用途** | 获取当前用户/门店的自定义标签列表，用于上传页和筛选栏渲染类型选项卡 |
| **请求参数** | 无需传参（后端根据当前登录用户/门店自动确定 scope） |
| **响应** | `{ total: number, list: [{ id, label }], max: 15 }` |
| **说明** | 当前设计限制最多15个自定义标签，前端校验 + 后端校验 |

### 9. 新增自定义标签

| 项目 | 内容 |
|------|------|
| **接口名** | `POST /api/custom-types` |
| **用途** | 在上传页或详情编辑面板中新建一个自定义标签 |
| **请求参数（JSON）** | `{ label: string }` |
| **响应** | `{ id: number, label: string }` |
| **说明** | `label` 最多20字，不可与系统预设类型或已有自定义标签重名 |

### 10. 删除自定义标签

| 项目 | 内容 |
|------|------|
| **接口名** | `DELETE /api/custom-types/:id` |
| **用途** | PC端自定义标签管理弹窗中删除标签 |
| **请求参数** | URL Path 参数 |
| **响应** | `{ success: true }` |
| **说明** | 如果已有记录使用了该标签，可选择：①禁止删除并提示；②删除标签但保留历史记录中的 type 字段不变 |

---

## 汇总

| 序号 | 方法 | 路径 | 用途 |
|------|------|------|------|
| 1 | `POST` | `/api/files/upload` | 上传图片文件 |
| 2 | `POST` | `/api/records` | 创建上传记录 |
| 3 | `GET` | `/api/records` | 查询记录列表（筛选+排序+分页） |
| 4 | `GET` | `/api/records/:id/files/:idx` | 获取单张图片详情 |
| 5 | `PATCH` | `/api/records/:id/files/:idx` | 更新图片元数据（类型+命名） |
| 6 | `DELETE` | `/api/records/:id/files/:idx` | 删除单张图片 |
| 7 | `PUT` | `/api/records/:id` | 编辑整条上传记录 |
| 8 | `GET` | `/api/custom-types` | 获取自定义标签列表 |
| 9 | `POST` | `/api/custom-types` | 新增自定义标签 |
| 10 | `DELETE` | `/api/custom-types/:id` | 删除自定义标签 |

**共 10 个 API 接口**，覆盖两大功能域：
- **记录与文件管理**（1~7）：文件上传、记录CRUD、单文件元数据编辑与删除
- **自定义标签管理**（8~10）：标签的增删查
