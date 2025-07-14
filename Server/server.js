const app = require('./src/app');
const PORT = process.env.PORT;
const IP = process.env.IP

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://${IP}:${PORT}`);
});