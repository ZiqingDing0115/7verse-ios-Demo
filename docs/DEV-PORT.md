# 开发端口（单一来源，请勿改错）

- **当前固定端口**：`5174`
- **配置位置**：`vite.config.js` → `server.port`、`server.strictPort: true`
- **测试前请 double check**：运行 `npm run dev` 后，终端会打印 `Local: http://localhost:5174/`，以该输出为准。

所有文档、测试链接、CORS 等均使用 **5174**。
