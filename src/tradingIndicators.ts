import {ema, macd , rsi, sma, parabolicSar} from "indicatorts";
import { HighAndLow, MacdResult, ParabolicSar } from "./types";

export class TradingIndicators {

  public rsi: number[] = [];
  // ------------------------------------- Trading Indicators ----------------------------------------

  /**
   *
   * @param values array of price data
   * @param period what period to calculate by
   * @returns
   */
  public async getEma(values: number[], period: number): Promise<number[]> {
    const result = ema(period, values);
    return result;
  }
  /**
   *
   * @param values - fifteenminute chart
   * @param period - 15
   * @returns
   */
  public async getSma(values: number[], period: number): Promise<number[]> {
    const result = sma(period, values);
    return result;
  }

  /**
   *
   * @param highs - highs for chart interval
   * @param lows - lows for chart interval
   * @param closing - closings for chart interval
   * @returns
   */
  public async getParabolicSar(
    highs: number[],
    lows: number[],
    closing: number[]
  ): Promise<ParabolicSar> {
    const result = parabolicSar(highs, lows, closing);
    return result;
  }
  /**
   *
   * @param closings
   */
  public async getRsi(closings: number[]) {
    if (closings.length < 14) {
      throw new Error("Cannot calculate RSI with less than 14 closing prices.");
    }

    const result = rsi(closings);
    const filteredResult = result.filter(
      (value) => value !== 100 && value !== 0
    );
    for (let i = 0; i < filteredResult.length; i++) {
      const rsiEntry = +filteredResult[i].toFixed(4);
      if (this.rsi.indexOf(rsiEntry) === -1) {
        this.rsi.push(rsiEntry);
      }
    }

  }
  /**
   *
   * @param closings - chart closings
   * @returns
   */
  public async getMacd(closings: number[]): Promise<MacdResult> {
    const result = macd(closings);
    const histogram = this.calculateMacdHistogram(
      result.macdLine,
      result.signalLine
    );
    const macdHistogram: MacdResult = {
      macdLine: result.macdLine,
      signalLine: result.signalLine,
      histogram: histogram,
    };
    return macdHistogram;
  }

  // Function to calculate MACD histogram
  private calculateMacdHistogram = (macdLine, signalLine) => {
    const macdHistogram = [];
    for (let i = 0; i < macdLine.length; i++) {
      const histogramValue = macdLine[i] - signalLine[i];
      macdHistogram.push(histogramValue);
    }
    return macdHistogram;
  };

  /**
   *
   * @param chart
   * @returns
   */
  public checkBuySignal(chart: number[]) {
    const currentPeriod = chart.length - 1;
    const previousPeriod = currentPeriod - 1;
    const prePreviousPeriod = currentPeriod - 2;

    if (
      chart[currentPeriod] > chart[previousPeriod] &&
      chart[previousPeriod] < chart[prePreviousPeriod]
    ) {
      // Price was previously decreasing and just crossed above the previous period,
      // and the previous period was also decreasing,
      // generate a buy signal
      console.log("Price crossed above the previous period");
      return true;
    } else {
      console.log(`Current price period: ${chart[currentPeriod]}`);
      console.log(`Previous price period: ${chart[previousPeriod]}`);
      return false;
    }
  }
  /**
   *
   * @param chart 1-minute price chart
   * @returns true if a sell signal is generated, false otherwise
   */
  public checkSellSignal(chart: number[]) {
    const currentPeriod = chart.length - 1;
    const previousPeriod = currentPeriod - 1;
    const prePreviousPeriod = currentPeriod - 2;

    if (
      chart[currentPeriod] < chart[previousPeriod] &&
      chart[previousPeriod] > chart[prePreviousPeriod]
    ) {
      // Price was previously increasing and just crossed below the previous period,
      // and the previous period was also increasing,
      // generate a sell signal
      console.log("Price crossed below the previous period");
      return true;
    } else {
      console.log(`Current price period: ${chart[currentPeriod]}`);
      console.log(`Previous price period: ${chart[previousPeriod]}`);
      return false;
    }
  }

  /**
   *
   * @param macdResult
   * @returns
   */
  public checkMacdBuySignal(macdResult: MacdResult) {
    const currentPeriod = macdResult.macdLine.length - 1;
    const previousPeriod = currentPeriod - 1;
    const prePreviousPeriod = currentPeriod - 2;

    if (
      macdResult.macdLine[currentPeriod] >
        macdResult.signalLine[currentPeriod] &&
      macdResult.macdLine[previousPeriod] <
        macdResult.signalLine[previousPeriod] &&
      macdResult.macdLine[prePreviousPeriod] <
        macdResult.signalLine[prePreviousPeriod]
    ) {
      // MACD lines were previously below the signal line and just crossed above,
      // and previous MACD lines were also below the signal line,
      // generate a buy signal
      console.log("MACD crossed above the signal");
      return true;
    } else {
      console.log(`Current MACD period: ${macdResult.macdLine[currentPeriod]}`);
      console.log(
        `Current signal period: ${macdResult.signalLine[currentPeriod]}`
      );
      return false;
    }
  }
  /**
   *
   * @param macdResult
   * @returns
   */
  public checkMacdSellSignal(macdResult: MacdResult) {
    const lastMacd = macdResult.macdLine[macdResult.macdLine.length - 1];
    const secondLastMacd = macdResult.macdLine[macdResult.macdLine.length - 2];
    const lastSignal = macdResult.signalLine[macdResult.signalLine.length - 1];
    const secondLastSignal =
      macdResult.signalLine[macdResult.signalLine.length - 2];

    const previousMacd = macdResult.macdLine[macdResult.macdLine.length - 3];
    const previousSignal =
      macdResult.signalLine[macdResult.signalLine.length - 3];

    if (
      lastMacd < lastSignal &&
      secondLastMacd > secondLastSignal &&
      previousMacd > previousSignal
    ) {
      // MACD lines were previously above the signal line and just crossed below,
      // and previous MACD lines were also above the signal line,
      // generate a sell signal
      console.log("MACD crossed below the signal, sell signal confirmed");
      return true;
    } else {
      console.log(`Current period MACD: ${lastMacd}`);
      console.log(`Current period signal: ${lastSignal}`);
      return false;
    }
  }

  /**
   *
   * @param period
   * @param rsiLowerThreshold
   * @returns
   */
  public async isRSIBuySignal(
    period: number,
    rsiLowerThreshold: number
  ): Promise<boolean> {
    const currentRSI = this.rsi[this.rsi.length - 1];

    if (currentRSI >= rsiLowerThreshold) {
      return false;
    }

    const startIndex = Math.max(this.rsi.length - period, 1);
    if (startIndex === 1 && this.rsi[0] >= rsiLowerThreshold) {
      return false;
    }

    for (let i = startIndex; i < this.rsi.length; i++) {
      const currentRSIInLoop = this.rsi[i];
      const previousRSIInLoop = this.rsi[i - 1];

      if (
        previousRSIInLoop < rsiLowerThreshold &&
        currentRSIInLoop >= rsiLowerThreshold
      ) {
        console.log("RSI dipped below threshold and is rebounding");
        return true; // Buy signal confirmed
      }
    }

    return false; // No buy signal detected
  }
  /**
   *
   * @param period
   * @param rsiUpperThreshold
   * @returns
   */
  public async isRSISellSignal(
    period: number,
    rsiUpperThreshold: number
  ): Promise<boolean> {
    const currentRSI = this.rsi[this.rsi.length - 1];

    if (currentRSI <= rsiUpperThreshold) {
      return false;
    }

    const startIndex = Math.max(this.rsi.length - period, 1);
    if (startIndex === 1 && this.rsi[0] <= rsiUpperThreshold) {
      return false;
    }

    for (let i = startIndex; i < this.rsi.length; i++) {
      const currentRSIInLoop = this.rsi[i];
      const previousRSIInLoop = this.rsi[i - 1];
      if (
        previousRSIInLoop > rsiUpperThreshold &&
        currentRSIInLoop <= rsiUpperThreshold
      ) {
        console.log("Rsi is above sell threshold and is returning");
        return true; // Sell signal confirmed
      }
    }

    return false; // No sell signal detected
  }

  /** Helper function to find highs and lows in an array
   *
   * @param data - input array
   * @returns
   */
  public async findHighAndLowValues(data: number[]): Promise<HighAndLow> {
    const highArray: number[] = [];
    const lowArray: number[] = [];
    let high: number = Number.MIN_SAFE_INTEGER;
    let low: number = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < data.length; i++) {
      const value: number = data[i];
      if (value > high) {
        high = value;
      }
      if (value < low) {
        low = value;
      }

      // Check for high and low values every 15 values
      if ((i + 1) % 15 === 0) {
        // Push high and low values to the respective arrays
        highArray.push(high);
        lowArray.push(low);
        // Reset high and low values for the next 15 values
        high = Number.MIN_SAFE_INTEGER;
        low = Number.MAX_SAFE_INTEGER;
      }
    }
    const highAndLowArray: HighAndLow = {
      high: highArray,
      low: lowArray,
    };
    return highAndLowArray;
  }

  /**
   *
   * @param values
   * @returns - direction of values based on period
   */
  public async valueDirection(
    values: number[],
    period: number,
    name: string
  ): Promise<string> {
    let sumRateOfChange = 0;
    let sortArray = values.slice(-period);
    for (let i = 1; i < sortArray.length; i++) {
      const rateOfChange = (sortArray[i] - sortArray[i - 1]) / sortArray[i - 1];
      sumRateOfChange += rateOfChange;
    }
    const averageRateOfChange = sumRateOfChange / (sortArray.length - 1);
    const roundedAverageRateOfChange =
      Math.round(averageRateOfChange * 100) / 100;
    console.log(
      `Average rate of ${name} change: ${roundedAverageRateOfChange}`
    );
    if (averageRateOfChange < 0) {
      return "Negative";
    } else if (averageRateOfChange > 0) {
      return "Positive";
    } else {
      return "No Change";
    }
  }

  
}
