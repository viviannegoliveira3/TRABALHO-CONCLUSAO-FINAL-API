const startServer = require('./graphql');
const PORT = process.env.PORT || 4000;

startServer().then(app => {
  app.listen(PORT, () => {
    console.log(`GraphQL server running on port ${PORT}`);
  });
});
