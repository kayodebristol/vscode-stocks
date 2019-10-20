# Stocks - Live Quotes for VSCode

[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/ranadeep.vscode-stocks-live?color=brightgreen)](https://marketplace.visualstudio.com/items?itemName=ranadeep.vscode-stocks-live)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/ranadeep.vscode-stocks-live?color=brightgreen)](https://marketplace.visualstudio.com/items?itemName=ranadeep.vscode-stocks-live)

Keep an eye on your stocks listed on _NYSE_, _NASDAQ_, _AMEX_, _ARCA_, and _BATS_ exchanges while using VS Code, with the "Stocks" extension.

## Features

Add as many stock symbols as you like to the status bar, and they will be updated every 60 (default) seconds (this is configurable). Just set `vscode-stocks.stockSymbols` to an array of stock symbols to monitor.

Yahoo Finance symbols (indicies, futures, crypto) are supported. Prefix the Yahoo Finance symbols with `YF:`. _Example_: `YF:GC=F` would return Gold futures price.

**NOTE**: It is **HIGHLY** recommended to use a refresh interval of `60000` (_60s_) if you are pulling Yahoo Finance symbols to avoid getting rate limited.

Shows prices during extended trading hours (pre-market and post-market) automatically.

Example:

```json
"vscode-stocks.stockSymbols": [
    "GOOG",
    "MSFT",
    "AAPL",
    "AMZN",
    "YF:GC=F",
]
```

<img src="https://raw.githubusercontent.com/ranadeeppolavarapu/vscode-stocks/master/images/example.png">

<img src="https://raw.githubusercontent.com/ranadeeppolavarapu/vscode-stocks/master/images/example_2.png">

<img src="https://raw.githubusercontent.com/ranadeeppolavarapu/vscode-stocks/master/images/yf_example.png">

<img src="https://raw.githubusercontent.com/ranadeeppolavarapu/vscode-stocks/master/images/full_screen_example.png">

It can show symbols color-coded by gain/loss with the setting `vscode-stocks.useColors`.

## Configurations

```json
  "vscode-stocks.stockSymbols": [
    "MSFT",
    "GOOG",
    "AAPL",
    "AMZN"
  ],
  "vscode-stocks.iexCloudAPIKeys": [
    "pk_abc123fakeApiKey"
  ],
  "vscode-stocks.colorStyle": [
    "red",
    "lime",
    "white"
  ],
  "vscode-stocks.useColors": true,
  "vscode-stocks.showChangeIndicator": true,
  "vscode-stocks.refreshInterval": 30000
```

# Disclaimer

By reading this, you agree that this will be used at your own risk.

Excerpt from IEXCloud Disclaimer (see [IEXCloud Terms](https://iexcloud.io/terms/))

> EXCEPT AS EXPRESSLY PROVIDED IN THIS AGREEMENT, ALL DATA IS PROVIDED “AS IS” AND ALL REPRESENTATIONS, WARRANTIES, TERMS AND CONDITIONS, ORAL OR WRITTEN, EXPRESS OR IMPLIED (BY COMMON LAW, STATUTE OR OTHERWISE), IN RELATION TO THE DATA ARE HEREBY EXCLUDED AND DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY LAW. IN PARTICULAR, IEX CLOUD AND ITS THIRD-PARTY DATA PROVIDERS DISCLAIM IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE AND MAKE NO WARRANTY OF ACCURACY, COMPLETENESS, TIMELINESS, FUNCTIONALITY, RELIABILITY OR SPEED OF DELIVERY OF THE DATA. CUSTOMER AGREES THAT THE DATA IS NOT INVESTMENT ADVICE AND ANY OPINIONS OR ASSERTIONS CONTAINED IN THE DATA DO NOT REPRESENT THE OPINIONS OR BELIEFS OF IEX CLOUD, ITS THIRD-PARTY DATA PROVIDERS, OR ANY OF ITS RESPECTIVE AFFILIATES OR ANY OF ITS RESPECTIVE EMPLOYEES. Neither IEX Cloud nor any of its third-party data providers warrant that IEX Cloud Data will be uninterrupted, error free, or completely secure. IEX Cloud and its third-party data providers expressly disclaim any liability for any loss or injury caused in whole or in part by negligence or any other error made by human or machine concerning the production, compilation, or distribution of IEX Cloud Data. Customer expressly assumes the entire risk for the results and performance of IEX Cloud Data and Services.
