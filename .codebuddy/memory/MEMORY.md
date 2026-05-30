# 项目记忆

## 项目概况
- 克丽缇娜(Chlitina)多模块前端项目集合，通过 test_server.js 在端口9018提供静态服务
- 开发服务器: `node test_server.js` → http://localhost:9018/

## 部署规范
- 所有项目统一部署到服务器 `/var/www/` 下，kebab-case 命名子目录
- Nginx 配置反向代理，静态项目用 `alias`，API 用 `proxy_pass`
- 服务器: lhins-p0csjffm (124.222.211.194)

## 已完成部署
- `/var/www/cltn/new-order-project/` — 新订单项目
- `/var/www/store_goal_mgmt_hl/` — 门店目标管理(含API反向代理 /api/→localhost:5001)
- `/var/www/upload-files/` — 文件上传模块

## 2026-05-30 开单收银需求分析
- 分析文件位于: `开单收银需求清单/` 目录
- 共45条需求: P0=16项, P1=13项, P3=14项, 未标注=1项(已验收), P1重复=1项
- 第1梯队(立即可开发): 10项已PRD/设计完成的P0+P1需求
- 已验收完成: 5项(APP入口、签字扩大、APP名称调整等)
- 转交鑫: 2项(美团券码同步、OTO自动生成订单)
- 重复需求: "撤销订单权限"在P1和P3各出现一次
