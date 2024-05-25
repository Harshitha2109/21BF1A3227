const express = require('express');
   const axios = require('axios');
   const app = express();
   const PORT = 9876;

   // Configuration
   const WINDOW_SIZE = 10;
   const TEST_SERVER_URLS = {
       'p': 'http://20.244.56.144/test/primes',
       'f': 'http://20.244.56.144/test/fibo',
       'e': 'http://20.244.56.144/test/even',
       'r': 'http://20.244.56.144/test/rand'
   };
   const REQUEST_TIMEOUT = 500; // 500 ms

   // Global state to store numbers
   let storedNumbers = [];

   async function fetchNumbers(url) {
       try {
           const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });
           return response.data.numbers || [];
       } catch (error) {
           return [];
       }
   }

   function updateNumbers(newNumbers) {
       let previousState = [...storedNumbers];
       newNumbers.forEach(number => {
           if (!storedNumbers.includes(number)) {
               if (storedNumbers.length >= WINDOW_SIZE) {
                   storedNumbers.shift();
               }
               storedNumbers.push(number);
           }
       });
       let currentState = [...storedNumbers];
       return { previousState, currentState };
   }

   app.get('/numbers/:numberid', async (req, res) => {
       const numberId = req.params.numberid;
       if (!TEST_SERVER_URLS[numberId]) {
           return res.status(400).json({ error: 'Invalid number ID' });
       }

       const url = TEST_SERVER_URLS[numberId];
       const newNumbers = await fetchNumbers(url);
       const { previousState, currentState } = updateNumbers(newNumbers);
       const avg = currentState.length ? (currentState.reduce((sum, num) => sum + num, 0) / currentState.length).toFixed(2) : 0.00;

       const response = {
           windowPrevState: previousState,
           windowCurrState: currentState,
           numbers: newNumbers,
           avg: avg
       };

       res.json(response);
   });

   app.listen(PORT, () => {
       console.log(`Server is running on http://localhost:${PORT}`);
   });