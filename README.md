# Stocks

Keep an eye on your stocks while using VS Code, with the "Stocks" extension.

## Features

Add as many stock symbols as you like to the status bar, and they will be updated every 60 seconds. Just set `vscode-stocks.stockSymbols` to an array of stock symbols to monitor. Example:

```json
"vscode-stocks.stockSymbols": [
    "GOOG",
    "MSFT",
    "AAPL",
    "AMZN"
]
```

<img src="https://user-images.githubusercontent.com/7084995/65375932-66263400-dc68-11e9-9a2e-f8021ed05305.png">

<img src="https://user-images.githubusercontent.com/7084995/65375933-6a525180-dc68-11e9-8304-3819fda494e2.png">

It can show symbols color-coded by gain/loss with the setting `vscode-stocks.useColors`.

<img src="https://user-images.githubusercontent.com/7084995/65375963-a4235800-dc68-11e9-9414-a2026a990e84.png">

## Configurations

```json
  "vscode-stocks.stockSymbols": [
    "MSFT",
    "GOOG",
    "AAPL",
    "AMZN"
  ],
  "vscode-stocks.iexCloudAPIKey": [
    "pk_abc123fakeApiKey"
  ],
  "vscode-stocks.colorStyle": [
    "red",
    "lime",
    "white"
  ],
  "vscode-stocks.useColors": true,
  "vscode-stocks.refreshInterval": 30000
```

## Disclaimer

By reading this, you agree that this is used at your own risk.

Excerpt from IEXCloud Disclaimer (see [IEXCloud Terms](https://iexcloud.io/terms/))

> EXCEPT AS EXPRESSLY PROVIDED IN THIS AGREEMENT, ALL DATA IS PROVIDED “AS IS” AND ALL REPRESENTATIONS, WARRANTIES, TERMS AND CONDITIONS, ORAL OR WRITTEN, EXPRESS OR IMPLIED (BY COMMON LAW, STATUTE OR OTHERWISE), IN RELATION TO THE DATA ARE HEREBY EXCLUDED AND DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY LAW. IN PARTICULAR, IEX CLOUD AND ITS THIRD-PARTY DATA PROVIDERS DISCLAIM IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE AND MAKE NO WARRANTY OF ACCURACY, COMPLETENESS, TIMELINESS, FUNCTIONALITY, RELIABILITY OR SPEED OF DELIVERY OF THE DATA. CUSTOMER AGREES THAT THE DATA IS NOT INVESTMENT ADVICE AND ANY OPINIONS OR ASSERTIONS CONTAINED IN THE DATA DO NOT REPRESENT THE OPINIONS OR BELIEFS OF IEX CLOUD, ITS THIRD-PARTY DATA PROVIDERS, OR ANY OF ITS RESPECTIVE AFFILIATES OR ANY OF ITS RESPECTIVE EMPLOYEES. Neither IEX Cloud nor any of its third-party data providers warrant that IEX Cloud Data will be uninterrupted, error free, or completely secure. IEX Cloud and its third-party data providers expressly disclaim any liability for any loss or injury caused in whole or in part by negligence or any other error made by human or machine concerning the production, compilation, or distribution of IEX Cloud Data. Customer expressly assumes the entire risk for the results and performance of IEX Cloud Data and Services.
