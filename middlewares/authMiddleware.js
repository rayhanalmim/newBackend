const Web3Token = require('web3-token');
require('dotenv').config();
exports.getAuthor = async function getUser(req, res, next) {
    try {
      //console.log(req.headers)
      const bearerToken = req.headers['authorization'];
      //const token = bearerToken?.split(' ')[1];
      if (!bearerToken) return res.status(401).send({ message: 'Unauthorized' });
      let add;
      try { 
        const { address, body } =  Web3Token.verify(bearerToken);
        add = address;
      } catch (error) {
        console.log(error)
        return res.status(401).send({ message: 'Unauthorized' });
      }
      // const authorizers = process.env.AuthorAddress;
      // console.log(authorizers[0])
      // console.log(add.toLowerCase())
      let valid = add.toLowerCase() === process.env.AuthorAddress.toLowerCase(); 
      console.log(valid)
      // for(let i = 0; i < authorizers.length; i++){
      //   if(add.toLowerCase() == authorizers[i].toLowerCase()){
      //       valid = true;
      //       break; 
      //   }
      // }
      if (!valid) return res.status(401).send({ message: 'Unauthorized' });
      req.author = add;
      console.log(add)
      next();
    } catch (error) {
      console.log(error);
      res.status(401).send({ message: 'Unauthorized' });
    }
  };

  exports.getUser = async function getUser(req, res, next) {
    try {
      console.log(req.headers)
      const bearerToken = req.headers['authorization'];
      //const token = bearerToken?.split(' ')[1];
      // console.log(bearerToken)
      if (bearerToken == undefined) return res.status(401).send({ message: 'Unauthorized' });
      let add;
      try { 
        const { address, body } =  Web3Token.verify(bearerToken);
         add = address;
      } catch (error) {
        console.log(error)
        return res.status(401).send({ message: 'Unauthorized' });
      }
      req.user = add;
      console.log(add)
      next();
    } catch (error) {
      console.log(error);
      res.status(401).send({ message: 'Unauthorized' });
    }
  };