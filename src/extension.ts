import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import * as iconv from 'iconv-lite';
import { DateTime } from 'luxon';
import { GeneralUtils } from './general.util';
import idx from 'idx';

let items: Map<string, vscode.StatusBarItem>;

const YAHOO_FINANCE_SYMBOL_PREFIX = 'YF';
let currentIEXCloudAPIKeyIdx: number = 0;

export function activate(context: vscode.ExtensionContext) {
  items = new Map<string, vscode.StatusBarItem>();
  const config = vscode.workspace.getConfiguration();
  const refreshInterval = config.get('vscode-stocks.refreshInterval', 60 * 1e3);

  refresh();
  setInterval(() => {
    const PRE_MARKET_OPEN_TIME = DateTime.fromObject({
      hour: 8,
      minute: 0,
      zone: 'America/New_York',
    });
    const POST_MARKET_CLOSE_TIME = DateTime.fromObject({
      hour: 18,
      minute: 0,
      zone: 'America/New_York',
    });

    /**
     * 5 is an ISO weekday of Friday.
     * @see: https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html
     */
    const IS_WEEKDAY =
      DateTime.local().setZone('America/New_York').weekday <= 5;
    const SHOULD_REFRESH: boolean =
      IS_WEEKDAY &&
      DateTime.local().setZone('America/New_York') > PRE_MARKET_OPEN_TIME &&
      DateTime.local().setZone('America/New_York') < POST_MARKET_CLOSE_TIME;

    if (SHOULD_REFRESH) {
      refresh();
    }
  }, refreshInterval);
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(refresh),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}

function refresh(): void {
  const config = vscode.workspace.getConfiguration();
  const configuredSymbols = config
    .get('vscode-stocks.stockSymbols', [])
    .map(symbol => symbol.toUpperCase());

  if (!arrayEq(configuredSymbols, Array.from(items.keys()))) {
    cleanup();
    fillEmpty(configuredSymbols);
  }

  refreshSymbols(configuredSymbols);
}

function fillEmpty(symbols: string[]): void {
  symbols.forEach((symbol, i) => {
    const sanitizedSymbol = symbol.replace(new RegExp(`^(YF:)`, 'i'), '');
    // Enforce ordering with priority
    const priority = symbols.length - i;
    const item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      priority,
    );
    item.text = `${sanitizedSymbol}: $…`;
    item.show();
    items.set(sanitizedSymbol, item);
  });
}

function cleanup(): void {
  items.forEach(item => {
    item.hide();
    item.dispose();
  });

  items = new Map<string, vscode.StatusBarItem>();
}

// http://qt.gtimg.cn/q=sz000001,sh000001
async function querySymbolsCN(codes): Promise<Array<Object>> {
  let options = {
    hostname: 'qt.gtimg.cn',
    path: `/q=${codes.join(',').toLowerCase()}`,
  };

  const parse = (str: string): Array<Object> => {
    return ('' + str)
      .replace(/[;\s]+$/, '')
      .split(';')
      .map(item => {
        let temp: any = {};
        let iraw = ('' + item).split('="');
        temp['symbol'] = iraw[0].replace(/^[\s\n]*v_/, '').toUpperCase();
        let values = iraw[1].split('~');
        [
          '市场',
          '名称',
          '代码',
          'latestPrice',
          '昨收',
          '今开',
          '成交量',
          '外盘',
          '内盘',
          '买一',
          '买一量',
          '买二',
          '买二量',
          '买三',
          '买三量',
          '买四',
          '买四量',
          '买五',
          '买五量',
          '卖一',
          '卖一量',
          '卖二',
          '卖二量',
          '卖三',
          '卖三量',
          '卖四',
          '卖四量',
          '卖五',
          '卖五量',
          '最近逐笔成交',
          '时间',
          'change',
          'changePercent',
          '最高',
          '最低',
          '价格/成交量/成交额',
          '成交量',
          '成交额',
          '换手率',
          '市盈率',
          '未知',
          '最高',
          '最低',
          '振幅',
          '流通市值',
          '总市值',
          '市净率',
          '涨停价',
          '跌停价',
        ].forEach(name => {
          temp[name] = values.shift() || '';
        });
        temp['最近逐笔成交'] = ('' + temp['最近逐笔成交']).split('|');
        return temp;
      });
  };

  return new Promise<Array<Object>>((resolve, reject) => {
    http
      .request(options, function(resp) {
        let chunks = [];

        resp.on('error', function(error) {
          reject(error);
        });

        resp.on('data', function(chunk) {
          chunks.push(chunk);
        });

        resp.on('end', function() {
          let charset =
            ((resp.headers['content-type'] || '').match(/charset=(\S+)/) ||
              [])[1] || 'GBK';
          let data = iconv.decode(Buffer.concat(chunks), charset);
          resolve(parse(data));
        });
      })
      .end();
  });
}

const SYMBOL_CN_REGEXP = /^(sh|sz)\d{6}$/i;
const YAHOO_REGEXP = new RegExp(`^(${YAHOO_FINANCE_SYMBOL_PREFIX}:).+$`, 'i'); // /^(YF:).+$/i;
async function fetchSymbols(symbols: string[]) {
  let symbols_cn = [];
  let symbols_yahoo = [];
  let symbols_others = [];
  symbols.forEach(symbol => {
    if (SYMBOL_CN_REGEXP.test(symbol)) {
      symbols_cn.push(symbol);
    } else if (YAHOO_REGEXP.test(symbol)) {
      symbols_yahoo.push(symbol.replace(new RegExp(`^(YF:)`, 'i'), ''));
    } else {
      symbols_others.push(symbol);
    }
  });
  let responseObj = {};
  if (symbols_others.length > 0) {
    const iexCloudAPIKeys: string[] = vscode.workspace
      .getConfiguration()
      .get('vscode-stocks.iexCloudAPIKeys', ['']);

    // Cycle through the API keys for IEXCloud.
    if (currentIEXCloudAPIKeyIdx > iexCloudAPIKeys.length) {
      currentIEXCloudAPIKeyIdx = 0;
    }
    const currentIEXCloudAPIKey = iexCloudAPIKeys[currentIEXCloudAPIKeyIdx];
    currentIEXCloudAPIKeyIdx++;

    let url = `https://cloud.iexapis.com/v1/stock/market/batch?symbols=${symbols_others.join(
      ',',
    )}&types=quote&displayPercent=true&token=${currentIEXCloudAPIKey}`;
    let response = await httpGet(url);
    responseObj = JSON.parse(response);
  }
  if (symbols_yahoo.length > 0) {
    for (const yahooSymbol of symbols_yahoo) {
      let url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?region=US&lang=en-US&includePrePost=true&interval=1m&range=1d`;
      let respYF = await httpGet(url);
      let resp = JSON.parse(respYF);

      let latestClosePrice = idx(resp, _ =>
        _.resp.chart.result[0].indicators.quote[0].close.pop(),
      );
      let latestPriceYF = GeneralUtils.isTruthy(latestClosePrice)
        ? latestClosePrice
        : resp.chart.result[0].meta.regularMarketPrice;
      responseObj[yahooSymbol] = {
        quote: {
          symbol: resp.chart.result[0].meta.symbol.toUpperCase(),
          latestPrice: latestPriceYF,
          extendedPrice: latestPriceYF,
          changePercent:
            ((latestPriceYF - resp.chart.result[0].meta.previousClose) /
              latestPriceYF) *
            100,
          change: latestPriceYF - resp.chart.result[0].meta.previousClose,
        },
      };
    }
  }
  if (symbols_cn.length > 0) {
    let respCN = await querySymbolsCN(symbols_cn);
    respCN.forEach(resp => {
      responseObj[resp['symbol']] = { quote: resp };
    });
  }

  return responseObj;
}

async function refreshSymbols(symbols: string[]): Promise<void> {
  if (!symbols.length) {
    return;
  }
  try {
    const responseObj = await fetchSymbols(symbols);
    Object.keys(responseObj).forEach(key =>
      updateItemWithSymbolQuote(responseObj[key].quote),
    );
  } catch (e) {
    console.error('vscode-stocks', e);
    throw new Error(`Invalid response: ${e.message}`);
  }
}

function updateItemWithSymbolQuote(symbolQuote) {
  const showChangeIndicator: boolean = vscode.workspace
    .getConfiguration()
    .get('vscode-stocks.showChangeIndicator', false);

  const MARKET_OPEN_TIME = DateTime.fromObject({
    hour: 9,
    minute: 30,
    zone: 'America/New_York',
  });
  const MARKET_CLOSE_TIME = DateTime.fromObject({
    hour: 16,
    minute: 0,
    zone: 'America/New_York',
  });

  /**
   * 5 is an ISO weekday of Friday.
   * @see: https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html
   */
  const IS_WEEKDAY = DateTime.local().setZone('America/New_York').weekday <= 5;
  const isMarketOpen: boolean =
    IS_WEEKDAY &&
    DateTime.local().setZone('America/New_York') > MARKET_OPEN_TIME &&
    DateTime.local().setZone('America/New_York') < MARKET_CLOSE_TIME;

  const symbol = symbolQuote.symbol.toUpperCase();
  const item = items.get(symbol);
  if (!item) return;

  const price = parseFloat(
    (
      Math.round(
        (isMarketOpen ? symbolQuote.latestPrice : symbolQuote.extendedPrice) *
          100,
      ) / 100
    ).toString(),
  ).toFixed(2);
  const percent: number = parseFloat(symbolQuote.changePercent);
  const change: number = parseFloat(symbolQuote.change);
  const changeArrow: Array<string> = ['↑', '↓', '(unch)'];
  const changeIndex = change > 0 ? 0 : change < 0 ? 1 : 2;

  item.text = `${symbol.toUpperCase()}: $${price} ${
    showChangeIndicator ? changeArrow[changeIndex] : ''
  } ${changeIndex !== 2 ? `(${percent.toFixed(2)}` : 'unch'}%)`;

  const config = vscode.workspace.getConfiguration();
  const useColors = config.get('vscode-stocks.useColors', false);
  const colorStyle = config.get('vscode-stocks.colorStyle', [
    '#fd6e70', // NASDAQ Red
    '#6cb33f', // NASDAQ Green
    'white', // unchanged
  ]);
  if (useColors) {
    item.color = colorStyle[changeIndex];
  } else {
    item.color = undefined;
  }
}

function httpGet(url): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      let responseData = '';
      response.on('data', chunk => (responseData += chunk));
      response.on('end', () => {
        // Sometimes the 'error' event is not fired. Double check here.
        if (response.statusCode === 200) {
          resolve(responseData);
        } else {
          console.error('vscode-stocks: httpGet failure...', response);
          reject('fail: ' + response.statusCode);
        }
      });
    });
  });
}

function arrayEq(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;

  return arr1.every((item, i) => item === arr2[i]);
}

function randomChoice<T>(items: T[]): T {
  return items[~~(items.length * Math.random())];
}
