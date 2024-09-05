const LottaverseContract = require("../helper/contracts");
const Game = require("../Modals/lottery");
const Purchase = require("../Modals/purchase");
const TicketHolder = require("../Modals/ticketHolders");
const { Contract, JsonRpcProvider } = require("ethers");
const lottaverseABI = require("../const/lottaverse.json");
const { contractAddress, fujiProviderUrl } = require("../const/address");
const user = require("../Modals/user");
const purchase = require("../Modals/purchase");

exports.purchase = async (req, res) => {
  const userid = req.user;
  try {
    const {
      lotteryId,
      _id,
      buyer,
      randomNumbers,
      amount,
      price,
      purchaseBy,
      referral,
      lotteryType,
      tax,
    } = req.body;

    console.log(req.body);

    console.log("from random number", randomNumbers);

    const dhakaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    });

    let alreadyUser = await TicketHolder.findOne({
      address: { $regex: buyer.toString(), $options: "i" },
    });
    //const totalBuy = await LottaverseContract.buyer(user);
    //const thisLotteryBuy = await LottaverseContract.LotteryBuyer(lotteryId, user);
    const totalPrice = price * amount;
    if (!alreadyUser) {
      alreadyUser = new TicketHolder({
        address: userid,
        totalBuy: totalPrice, //Number(totalBuy),
        lotteryBuy: { lotteryType: totalPrice }, //Number(thisLotteryBuy)}
      });
    } else {
      alreadyUser.totalBuy += totalPrice; //Number(totalBuy);
      alreadyUser.lotteryBuy[lotteryType] = totalPrice; //Number(thisLotteryBuy);
    }

    const lottery = await Game.findById({ _id });
    const alreadyLotteryHolders = lottery.holders.includes(alreadyUser._id);
    if (!alreadyUser.participate.includes(lottery._id))
      alreadyUser.participate.push(lottery._id);
    await alreadyUser.save();
    if (!alreadyLotteryHolders) lottery.holders.push(alreadyUser._id);
    let boughtByUser = 0;
    if (lottery.holdersBuy?.get(buyer.toLowerCase()) !== undefined) {
      boughtByUser = Number(lottery.holdersBuy.get(buyer.toLowerCase()));
    }
    lottery.set(
      `holdersBuy.${buyer.toLowerCase()}`,
      Number(boughtByUser) + Number(amount * price)
    );
    const newPurchase = await new Purchase({
      buyer,
      LotteryId: lottery._id,
      amount,
      randomNumbers,
      purchaseTime: dhakaTime,
      price,
    });
    if (purchaseBy) newPurchase.purchaseBy = purchaseBy;
    await newPurchase.save();
    lottery.purchases.push(newPurchase._id);
    lottery.ticketSold =
      lottery.ticketSold == undefined
        ? Number(amount)
        : lottery.ticketSold + Number(amount);
    lottery.taxCollected
      ? (lottery.taxCollected += tax[4])
      : (lottery.taxCollected = tax[4]);
    const treTax = tax[4] - (tax[0] + tax[1] + tax[2] + tax[3]);
    console.log(treTax);
    lottery.treasuryTax
      ? (lottery.treasuryTax += treTax)
      : (lottery.treasuryTax = treTax);
    await lottery.save();
    let referralUser;
    referralUser = await TicketHolder.findOne({
      address: { $regex: referral.toString(), $options: "i" },
    });
    if (!referralUser) {
      referralUser = new TicketHolder({
        address: referral,
        firstLavelRafferal: [alreadyUser._id],
      });
    } else {
      if (!referralUser.firstLavelRafferal.includes(alreadyUser._id)) {
        referralUser.firstLavelRafferal.push(alreadyUser._id);
      }
    }
    await referralUser.save();

    try {
      console.log("buyer", buyer);
      const updateAcountStarus = await user.findOneAndUpdate(
        { address: buyer },
        { $set: { referralId: "" } }
      );
      console.log("updateAcountStarus", updateAcountStarus);
    } catch (error) {
      console.log("error: ", error);
    }

    res.status(200).send("Ticket purchase successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong");
  }
};

exports.getLotteryBuyer = async (req, res) => {
  const { lotteryId } = req.query;
  try {
    const lottery = await Game.findById(lotteryId).populate(
      "holders",
      "address totalBuy"
    );
    if (!lottery) res.status(500).send("Invalid Lottery id");
    console.log(lottery);
    res.status(200).json(lottery);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

exports.getLeaderBuyer = async (req, res) => {
  try {
    const holders = await TicketHolder.find({
      firstLavelRafferal: { $size: 1 },
      premium: true,
    });

    if (!holders) res.status(500).send("No holders");
    res.status(200).json(holders);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.getLotteryHistory = async (req, res) => {
  try {
    const Lotteries = await Game.find({});
    res.status(200).send(Lotteries);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.getOngoingLottery = async (req, res) => {
  try {
    const Lotteries = await Game.find().populate("holders", "address totalBuy");
    res.status(200).send(Lotteries);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.addPremiums = async (req, res) => {
  const address = req.body.member;
  try {
    let alreadyUser = await TicketHolder.findOne({
      address: { $regex: address.toString(), $options: "i" },
    });
    if (!alreadyUser) {
      alreadyUser = new TicketHolder({
        address,
      });
    }
    alreadyUser.premium = true;
    await alreadyUser.save();
    res.status(500).send("Successfully added premium members");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

exports.getPremiums = async (req, res) => {
  try {
    const holders = await TicketHolder.find({ premium: true }).exec();
    console.log(holders);
    if (!holders) res.status(500).send("No holders");
    res.status(200).send(holders);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};
exports.createLottery = async (req, res) => {
  try {
    const {
      lotteryId,
      price,
      topPrize,
      maxTicket,
      generalPrize,
      prizeDistribution,
      lotteryType,
      tax,
    } = req.body;
    let totalPrize = 0;
    for (let i = 0; i < prizeDistribution.length; i++) {
      totalPrize += Number(prizeDistribution[i]);
    }
    const newLottery = new Game({
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
    });
    await newLottery.save();
    console.log(newLottery);
    res.status(200).send("Lottery created successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

exports.updateLottery = async (req, res) => {
  const { drawn, id } = req.body;
  try {
    const lottery = await Game.findById(id);
    if (!lottery) res.status(500).send("lottery not found");
    lottery.drawn = drawn;
    const provider = new JsonRpcProvider(fujiProviderUrl);
    const contract = new Contract(contractAddress, lottaverseABI, provider);
    for (let i = 0; i < lottery.prizeDistribution.length; i++) {
      lottery.winners.push(await contract.lotterywinners(lottery.lotteryId, i));
    }
    //lottery.winners.push(winner);
    await lottery.save();
    res.status(200).send("Successfully draw completed");
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong");
  }
};

// ---------------------------------------------------------------------------------------------------------------------------

exports.getLottery = async (req, res) => {
  const { walletAdress } = req.params;
  console.log(walletAdress);
  try {
    const getMyPurchesLottrey = await Purchase.find({
      buyer: walletAdress,
      randomNumbers: { $exists: true, $ne: null }, // Filter where randomNumbers exists and is not null
    }).populate({
      path: "LotteryId", // The field in Purchase that references Lottery
      model: Game, // The model to populate from
    });

    res.send(getMyPurchesLottrey);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

exports.getRound = async (req, res) => {
  const { type } = req.params;
  try {
    const getRound = await Game.find({ lotteryType: type });
    const length = getRound.length;
    res.send({ length });
  } catch (error) {}
};

exports.checkReferal = async (req, res) => {
  const { adress } = req.params;
  const { ref } = req.query;

  if (adress == ref) {
    return res.send(null);
  }

  if (ref) {
    const isValidReferal = await user.findOne({ address: ref });
    if (!isValidReferal) {
      return res.send(null);
    }
  }

  if (ref != "undefined") {
    const updatedUser = await user.findOneAndUpdate(
      { address: adress }, // Replace `userId` with the actual user ID or query condition
      { referredBy: ref },
      { new: true } // This returns the updated document
    );

    if (updatedUser) {
      let firstUser = await user.findOneAndUpdate(
        { address: ref },
        {
          $push: { referredUsers: { user: adress, refLevel: 1 } },
        },
        { new: true } // This returns the updated document
      );

      console.log("from curret state", firstUser);

      if (firstUser?.referredBy) {
        let secondUser = await user.findOneAndUpdate(
          { address: firstUser.referredBy },
          {
            $push: { referredUsers: { user: adress, refLevel: 2 } },
          },
          { new: true } // This returns the updated document
        );
        if (secondUser?.referredBy) {
          let thirdUser = await user.findOneAndUpdate(
            { address: secondUser.referredBy },
            {
              $push: { referredUsers: { user: adress, refLevel: 3 } },
            },
            { new: true } // This returns the updated document
          );
          if (thirdUser?.referredBy) {
            let fourthUser = await user.findOneAndUpdate(
              { address: thirdUser.referredBy },
              {
                $push: { referredUsers: { user: adress, refLevel: 4 } },
              },
              { new: true } // This returns the updated document
            );
            if (fourthUser?.referredBy) {
              let fivethUser = await user.findOneAndUpdate(
                { address: fourthUser.referredBy },
                {
                  $push: { referredUsers: { user: adress, refLevel: 5 } },
                },
                { new: true } // This returns the updated document
              );
              if (fivethUser?.referredBy) {
                let sixUser = await user.findOneAndUpdate(
                  { address: fivethUser.referredBy },
                  {
                    $push: { referredUsers: { user: adress, refLevel: 6 } },
                  },
                  { new: true } // This returns the updated document
                );
                if (sixUser?.referredBy) {
                  let serven = await user.findOneAndUpdate(
                    { address: sixUser.referredBy },
                    {
                      $push: { referredUsers: { user: adress, refLevel: 7 } },
                    },
                    { new: true } // This returns the updated document
                  );
                }
              }
            }
          }
        }
      }
    }

    const temp = updatedUser?.referredBy;
    return res.send(temp);
  } else {
    const referExists = await user.findOne({ address: adress });
    const temp = referExists?.referredBy || null;
    res.send(temp);
  }
};

// exports.getReferal = async (req, res) => {
//   const { adress } = req.params;
//   try {
//     console.log();
//     const userData = await user.findOne({ address: adress });
//     res.send({ userData });
//   } catch (error) {}
// };

exports.getReferal = async (req, res) => {
  const { adress } = req.params;

  try {
    // Find the primary user by address
    const primaryUser = await user.findOne({ address: adress });

    if (!primaryUser) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(primaryUser);
    // Extract referred user addresses
    const referredUserAddresses = primaryUser.referredUsers.map(
      (ref) => ref.user
    );

    console.log(referredUserAddresses);

    // Fetch details for each referred user
    const referredUsersDetails = await Promise.all(
      referredUserAddresses.map(async (address) => {
        const userDetail = await user.findOne({ address });
        if (userDetail) {
          return {
            address: userDetail.address,
            earnings: userDetail.earnings,
            commissionEarnings: userDetail.commissionEarnings,
            availableBalance: userDetail.availableBalance,
            userType: userDetail.userType,
          };
        } else {
          // If userDetail is null, return default values or handle it as needed
          return {
            address: address,
            earnings: 0,
            commissionEarnings: 0,
            availableBalance: 0,
            userType: "unknown",
          };
        }
      })
    );

    // Add details to the referredUsers array
    const updatedReferredUsers = primaryUser.referredUsers.map(
      (ref, index) => ({
        ...ref,
        userDetails: referredUsersDetails[index],
      })
    );

    // Prepare the response data
    const responseData = {
      ...primaryUser._doc, // Spread the primary user data
      referredUsers: updatedReferredUsers,
    };

    // Send the populated user data
    res.json({ userData: responseData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user data" });
  }
};

// Function to calculate total amount spent by each buyer
const calculateTotalSpent = (groupedByBuyer) => {
  const totalSpent = {};

  Object.entries(groupedByBuyer).forEach(([buyer, purchases]) => {
    totalSpent[buyer] = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );
  });

  console.log("Server is running on port 8080.");
  Object.entries(totalSpent).forEach(([buyer, total]) => {
    console.log(`Total spent by ${buyer}: ${total}`);
  });

  return totalSpent;
};

// ----------------------topBuyer
exports.topBuyer = async (req, res) => {
  try {
    const holders = await purchase.find();

    const groupedByBuyer = holders.reduce((acc, current) => {
      const buyer = current.buyer.toLowerCase(); // To ensure case-insensitivity
      if (!acc[buyer]) {
        acc[buyer] = [];
      }
      acc[buyer].push(current);
      return acc;
    }, {});

    const sortedData = Object.entries(groupedByBuyer)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([key, value]) => ({
        buyer: key,
        purchases: value,
      }));

    res.status(200).json({ sortedData });
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.topLeader = async (req, res) => {
  try {
    const holders = await purchase.find();
    let topleaderAccount = [];
    let topLeader = [];

    // Group by buyer
    const groupedByBuyer = holders.reduce((acc, current) => {
      const buyer = current.buyer; // To ensure case-insensitivity
      if (!acc[buyer]) {
        acc[buyer] = [];
      }
      acc[buyer].push(current);
      return acc;
    }, {});

    // Calculate number of tickets for each buyer
    const ticketCounts = Object.keys(groupedByBuyer).reduce((acc, buyer) => {
      acc[buyer] = groupedByBuyer[buyer].length;
      return acc;
    }, {});

    // Filter buyers with at least 10 tickets
    const qualifiedBuyers = Object.keys(ticketCounts).filter(
      (buyer) => ticketCounts[buyer] >= 10
    );

    // Filter grouped data to include only those with at least 10 tickets
    const filteredGroupedByBuyer = Object.keys(groupedByBuyer)
      .filter((buyer) => qualifiedBuyers.includes(buyer))
      .reduce((acc, buyer) => {
        acc[buyer] = groupedByBuyer[buyer];
        return acc;
      }, {});

    for (const buyer in filteredGroupedByBuyer) {
      const isPremium = await user.findOne({
        address: buyer,
        userType: "premium",
      });

      if (isPremium) {
        // Count the number of referredUsers with refLevel: 1
        const referralCount = isPremium.referredUsers.filter(
          (referral) => referral.refLevel === 1
        ).length;

        console.log("inside the referal functions: ", referralCount);

        if (referralCount >= 10) {
          // Count the number of referredUsers by each refLevel
          const referralCounts = {};
          for (let level = 1; level <= 7; level++) {
            referralCounts[level] = isPremium.referredUsers.filter(
              (referral) => referral.refLevel === level
            ).length;
          }

          // Check if the user has at least 10 referrals at refLevel: 1
          if (referralCounts[1] >= 10) {
            console.log(
              `User ${buyer} has ${referralCounts[1]} refLevel: 1 referrals.`
            );

            // Check if the user has at least 1 referral at each level from 1 to 7
            const hasAllLevels = Object.keys(referralCounts).every(
              (level) => referralCounts[level] > 0
            );

            if (hasAllLevels) {
              console.log(
                `User ${buyer} has referrals at all levels from 1 to 7.`
              );
              topleaderAccount.push(buyer);
            }
          }
        }
      }
    }

    topLeader.map(async (user) => {
      const holders = await purchase.findOne({ address: user });
      if (holders) {
        topLeader.push(holders);
      }
    });

    res.status(200).json({ topLeader });
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
};

exports.generationRefer = async (req, res) => {
  const { userId } = req.params;
  let userData = [];

  try {
    const currentUser = await user.findOne({ address: userId });

    if (currentUser) {
      // Use Promise.all to wait for all asynchronous operations to complete
      userData = await Promise.all(
        currentUser.referredUsers.map(async (item) => {
          const fetchCurrentUser = await purchase.find({ buyer: item.user });
          let totalSum = fetchCurrentUser.reduce((accumulator, item) => {
            return accumulator + item.price;
          }, 0);

          // Calculate the commission based on refLevel
          if (item.refLevel == 1) {
            totalSum = (totalSum / 100) * 10;
          }
          if (item.refLevel == 2) {
            totalSum = (totalSum / 100) * 5;
          }
          if (item.refLevel == 3) {
            totalSum = (totalSum / 100) * 3;
          }
          if (item.refLevel == 4) {
            totalSum = (totalSum / 100) * 2;
          }
          if (item.refLevel == 5) {
            totalSum = (totalSum / 100) * 1;
          }
          if (item.refLevel == 6) {
            totalSum = (totalSum / 100) * 1;
          }
          if (item.refLevel == 7) {
            totalSum = (totalSum / 100) * 1;
          }

          const checkActiveStatus = await user.findOne({ address: item.user });
          const combainData = {
            userId: item.user,
            refLevel: item.refLevel,
            commision: totalSum || 0,
            activeStatus: checkActiveStatus.referralId,
          };

          return combainData;
        })
      );
    }

    console.log("from outer : ", userData);
    res.send(userData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred." });
  }
};

exports.totalPurcheses = async (req, res) => {
  const { userId } = req.params;

  try {
    const fetchCurrentUser = await purchase.find({ buyer: userId });
    let totalSum = fetchCurrentUser.reduce((accumulator, item) => {
      return accumulator + item.price;
    }, 0);
    res.send({ totalSum });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred." });
  }
};
