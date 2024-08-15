const LottaverseContract = require('../helper/contracts');
const Lottery   = require('../Modals/lottery');
const Purchase = require('../Modals/purchase');
const TicketHolder = require('../Modals/ticketHolders');
const {Contract, JsonRpcProvider} = require('ethers');
const lottaverseABI = require('../const/lottaverse.json')
const {contractAddress, fujiProviderUrl} = require('../const/address')

exports.purchase = async (req, res)=>{
    const user = req.user;
    try{
    const {lotteryId, _id, buyer, amount, price, purchaseBy, referral, lotteryType, tax} = req.body;
    let alreadyUser = await TicketHolder.findOne({address: { $regex: buyer.toString(), $options: "i" },});
    //const totalBuy = await LottaverseContract.buyer(user);
    //const thisLotteryBuy = await LottaverseContract.LotteryBuyer(lotteryId, user);
    const totalPrice = (price*amount);
    if(!alreadyUser){
        alreadyUser =  new TicketHolder({
         address : user,
         totalBuy: totalPrice,//Number(totalBuy),
         lotteryBuy: {lotteryType : totalPrice}//Number(thisLotteryBuy)}
        })
        
    }else{
        alreadyUser.totalBuy = totalPrice //Number(totalBuy);
        alreadyUser.lotteryBuy[lotteryType] = totalPrice//Number(thisLotteryBuy);
    }
    
   const lottery = await Lottery.findById({_id});
   const alreadyLotteryHolders  = lottery.holders.includes(alreadyUser._id);
   if(!alreadyUser.participate.includes(lottery._id))
    alreadyUser.participate.push(lottery._id);
    await alreadyUser.save();
   if(!alreadyLotteryHolders) lottery.holders.push(alreadyUser._id);
   let boughtByUser = 0;
   if(lottery.holdersBuy?.get(buyer.toLowerCase()) !== undefined){
     boughtByUser = Number(lottery.holdersBuy.get(buyer.toLowerCase()));
   }
   lottery.set(`holdersBuy.${buyer.toLowerCase()}`, Number(boughtByUser) + Number(amount*price));
   const newPurchase = await new Purchase({
     buyer,
     LotteryId: lottery._id,
     amount,
     price
   })
   if(purchaseBy)
   newPurchase.purchaseBy = purchaseBy;
   await newPurchase.save();
   lottery.purchases.push(newPurchase._id);
   lottery.ticketSold = lottery.ticketSold == undefined ?  Number(amount) : lottery.ticketSold + Number(amount);
   lottery.taxCollected ? lottery.taxCollected += tax[4] : lottery.taxCollected = tax[4] 
   const treTax = tax[4] - (tax[0] + tax[1] + tax[2] + tax[3])
   console.log(treTax)
   lottery.treasuryTax ? lottery.treasuryTax += treTax : lottery.treasuryTax = treTax;
   await lottery.save()
   let referralUser
    referralUser = await TicketHolder.findOne({address: { $regex: referral.toString(), $options: "i" },});
   if(!referralUser){
    referralUser = new TicketHolder({
        address: referral,
        firstLavelRafferal : [alreadyUser._id]
    })
   }else{
    if(!referralUser.firstLavelRafferal.includes(alreadyUser._id)){
        referralUser.firstLavelRafferal.push(alreadyUser._id);
    }
   }
   await referralUser.save();
   res.status(200).send("Ticket purchase successfully")
  }catch(err){
    console.log(err);
    res.status(500).send("something went wrong")
  }
}

exports.getLotteryBuyer = async(req, res)=> {
    const {lotteryId} = req.query;
    try{
    const lottery = await Lottery.findById(lotteryId)
                    .populate("holders", "address totalBuy");
    if(!lottery) res.status(500).send('Invalid Lottery id');
    console.log(lottery)
    res.status(200).json(lottery);
    }catch(err){
        console.log(err)
        res.status(500).send('Something went wrong');
    }
}

exports.getLeaderBuyer = async(req, res)=> {
    try{
    const holders = await TicketHolder.find({ firstLavelRafferal: { $size: 1 }, premium : true });

    if(!holders) res.status(500).send('No holders');
    res.status(200).json(holders);
    }catch(err){
        res.status(500).send('Something went wrong');
    }
}

exports.getLotteryHistory = async(req, res) => {
    try{
      const Lotteries = await Lottery.find({});
      res.status(200).send(Lotteries); 
    }catch(err){
        res.status(500).send('Something went wrong'); 
    }
}

exports.getOngoingLottery = async(req, res) => {
    try{
      const Lotteries = await Lottery.find().populate("holders", "address totalBuy");;
      res.status(200).send(Lotteries); 
    }catch(err){
        res.status(500).send('Something went wrong'); 
    }
}

exports.addPremiums = async(req, res)=>{
    const  address = req.body.member;
    try{
    let alreadyUser = await TicketHolder.findOne({address: { $regex: address.toString(), $options: "i" },});
    if(!alreadyUser){
        alreadyUser =  new TicketHolder({
            address
        }) 
    }
    alreadyUser.premium = true;
    await alreadyUser.save();
    res.status(500).send("Successfully added premium members");
   }catch(err){
    console.log(err);
    res.status(500).send("Something went wrong");
   }
}

exports.getPremiums = async(req, res)=>{
    try{
        const holders = await TicketHolder.find({premium: true}).exec()
        console.log(holders)
        if(!holders) res.status(500).send('No holders');
        res.status(200).send(holders);
        }catch(err){
            res.status(500).send('Something went wrong');
        }
}
exports.createLottery = async (req, res) => {
    try{
        const {lotteryId, price, topPrize, maxTicket, generalPrize, prizeDistribution, lotteryType, tax} = req.body;
        let totalPrize = 0;
        for(let i=0; i < prizeDistribution.length; i++){
            totalPrize += Number(prizeDistribution[i]);
        }
        const newLottery = new Lottery({
            lotteryId,
            price,
            topPrize,
            maxTicket,
            generalPrize,
            lotteryType,
            prizeDistribution,
            totalPrize,
            tax,
            drawn: false,
        })
       await newLottery.save();
       console.log(newLottery)
       res.status(200).send('Lottery created successfully');
    }catch(err){
        console.log(err)
        res.status(500).send('Something went wrong');
    }
}

exports.updateLottery = async(req, res)=>{
    const {drawn, id} = req.body;
    try {
        const lottery = await Lottery.findById(id);
        if(!lottery) res.status(500).send("lottery not found")
        lottery.drawn = drawn;
        const provider = new JsonRpcProvider(fujiProviderUrl);
        const contract = new Contract(contractAddress, lottaverseABI, provider);
        for(let i = 0; i < lottery.prizeDistribution.length; i++){
            lottery.winners.push(await contract.lotterywinners(lottery.lotteryId, i)) 
        }
        //lottery.winners.push(winner);
        await lottery.save();
       res.status(200).send("Successfully draw completed");
    } catch (error) {
        console.log(error)
        res.status(500).send("something went wrong")
    }
}