module.exports = (app) => {
  const Basic = require("../Controllers/Basic.js");
  const auth = require("../middlewares/authMiddleware.js");
  app.get("/buyerList", Basic.getLotteryBuyer);
  app.post("/purchase", auth.getUser, Basic.purchase);
  app.post("/createLottery", auth.getUser, Basic.createLottery);
  app.post("/add-premiums", auth.getUser, Basic.addPremiums);
  app.get("/get-Lotteries", Basic.getOngoingLottery);
  app.get("/leaderBuyer", Basic.getLeaderBuyer);
  app.get("/lotteryBuyer", Basic.getLotteryBuyer);
  app.get("/get-premiums", Basic.getPremiums);
  app.post("/update-lottery", auth.getAuthor, Basic.updateLottery);

  // ----------------------------------------------------
  app.get("/getMyPurchesLottrey/:walletAdress", Basic.getLottery);
  app.get("/get-round/:type", Basic.getRound);
  app.get("/check-refer/:adress", Basic.checkReferal);
};
