<template>
  <v-container fluid color="grey darken-3" class="mt-5">
    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1" :complete="step > 1">
        Input your crypto history
        <small>Tell us about the crypto you have bought and sold.</small>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-card hover color="grey darken-2" class="mb-5">
          <v-card-title class="subheading">
            BlockTax can automatically grab your previous trades using an exchange provided api key
          </v-card-title>
          <v-card-text v-if="exchanges.length > 0">
            <template v-for="(item, index) in exchanges">
              <v-card hover>
                <v-card-title class = "subheading">
                  {{ item.name }}
                </v-card-title>
                <v-card-text>
                  <v-alert outline type="warning" :value="true">
                    For security, make sure your generated key is read-only
                  </v-alert>
                  <v-text-field
                    name="apikey"
                    label="enter your api key"
                    id="apikey"
                    v-model="item.apiKey"
                  ></v-text-field>
                  <v-text-field
                    name="secretkey"
                    label="enter your secret key"
                    id="secretkey"
                    v-model="item.secretKey"
                  ></v-text-field>
                </v-card-text>
                <v-divider/>
              </v-card>
              <v-divider/>
            </template>
          </v-card-text>
          <v-card-actions>
            <v-menu offset-y>
              <v-btn color="secondary" slot="activator">add exchange</v-btn>
              <v-list>
                <v-list-tile v-for="exchange in supportedExchanges" :key="exchange" @click="addExchange(exchange)">
                  <v-list-tile-title>{{ exchange }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
        <v-card hover color="grey darken-2" class="mb-5">
          <v-card-title class="subheading">You can also input your trades manually</v-card-title>
          <v-card-text v-if="trades.length > 0">
            <template v-for="(item, index) in trades">
              <v-card hover>
                <v-card-text>
                  <v-text-field
                    class="pb-2"
                    name="acquired"
                    label="the crypto or fiat you acquired"
                    id="acquired"
                    v-model="item.aquired"
                  ></v-text-field>
                  <v-text-field
                    mask="#########################"
                    name="qtyAcquired"
                    label="the amount of crypto or fiat you acquired"
                    id="qtyAcquired"
                    v-model="item.qtyAquired"
                  ></v-text-field>
                  <v-text-field
                    class="pb-2"
                    name="sold"
                    label="the crypto or fiat you sold"
                    id="sold"
                    v-model="item.sold"
                  ></v-text-field>
                  <v-text-field
                    mask="#########################"
                    name="qtySold"
                    label="the amount of crypto or fiat you sold"
                    id="qtySoldAcquired"
                    v-model="item.qtySold"
                  ></v-text-field>
                  <v-text-field
                    mask="#########################"
                    name="pricePerUnit"
                    label="the price per unit of the asset you acquired"
                    id="pricePerUnit"
                    v-model="item.pricePerUnit"
                  ></v-text-field>
                  <v-text-field
                    mask="##/##/#### ##:##"
                    name="datetime"
                    label="datetime (e.g. 06/18/2017 14:30)"
                    id="datetime"
                    v-model="item.timestamp"
                  ></v-text-field>
                </v-card-text>
                <v-divider/>
              </v-card>
            </template>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" @click="addTrade">add trade</v-btn>
          </v-card-actions>
        </v-card>
        <v-btn flat color="primary" @click.native="step = 2">Continue</v-btn>
        <v-btn flat to="/">Cancel</v-btn>
      </v-stepper-content>
      <v-stepper-step step="2" :complete="step > 2">
        Determine your tax bracket
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-select
          :items="['single', 'married, filing separately', 'married, filing jointly', 'head of household']"
          v-model="maritalStatus"
          label="marital status"
        >
        </v-select>
        <v-text-field
          mask="###############"
          prefix="$"
          label="annual income"
        >
        </v-text-field>
        <v-btn :loading="loadingSummary" flat color="primary" @click.native="calculateTaxes()">Calculate tax summary</v-btn>
        <v-btn flat @click.native="step = 1">Back</v-btn>
      </v-stepper-content>
      <v-stepper-step step="3" :complete="step > 3">
        Do your taxes!
        <small>
          Short-term gains are calculated differently than long-term ones.<br/>
          BlockTax breaks down both kinds for you here.
        </small>
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-card hover class="mb-2" color="grey darken-2">
          <v-card-title>
            <div>
              Short-term gains (Form 8949, Part 1 - ordinary income tax)<br/>
              <h3 v-if="Summary.TotalShortTermGainLoss < 0">Total losses: <span class="red--text" >{{ Summary.TotalShortTermGainLoss }}</span></h3>
              <h3 v-else>Total gains: <span class="green--text">{{ Summary.TotalShortTermGainLoss }}</span></h3>
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="ShortTermTransactionsFormatted"
              class="elevation-1"
            >
              <template slot="items" slot-scope="props">
                <td>{{ props.item.Description }}</td>
                <td class="text-xs-right">{{ props.item.DateAcquired }}</td>
                <td class="text-xs-right">{{ props.item.DateSoldDisposed }}</td>
                <td class="text-xs-right">{{ props.item.SalesPriceUsd }}</td>
                <td class="text-xs-right">{{ props.item.CostBasis }}</td>
                <td class="text-xs-right">{{ props.item.GainLoss }}</td>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <download-excel
              class   = ""
              :data   = "ShortTermTransactionsFormatted"
              :fields = "excelHeaders"
              type    = "csv"
              name    = "short-term-gains.csv"
            >
              <v-btn color="secondary">Download csv</v-btn>
            </download-excel>
          </v-card-actions>
        </v-card>
        <v-card hover class="mb-1" color="grey darken-2">
          <v-card-title>
            <div>
              Long-term gains (Form 8949, Part 2 - capital gains tax)<br/>
              <h3 v-if="Summary.TotalLongTermGainLoss < 0">Total losses: <span class="red--text" >{{ Summary.TotalLongTermGainLoss }}</span></h3>
              <h3 v-else>Total gains: <span class="green--text">{{ Summary.TotalLongTermGainLoss}}</span></h3>
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="LongTermTransactionsFormatted"
              class="elevation-1"
            >
              <template slot="items" slot-scope="props">
                <td>{{ props.item.Description }}</td>
                <td class="text-xs-right">{{ props.item.DateAcquired }}</td>
                <td class="text-xs-right">{{ props.item.DateSoldDisposed }}</td>
                <td class="text-xs-right">{{ props.item.SalesPriceUsd }}</td>
                <td class="text-xs-right">{{ props.item.CostBasis }}</td>
                <td class="text-xs-right">{{ props.item.GainLoss }}</td>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <download-excel
              class   = ""
              :data   = "LongTermTransactionsFormatted"
              :fields = "excelHeaders"
              type    = "csv"
              name    = "long-term-gains.csv"
            >
              <v-btn color="secondary">Download csv</v-btn>
            </download-excel>
          </v-card-actions>
        </v-card>
        <v-btn flat @click.native="step = 2">Back</v-btn>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'

  export default {
    data () {
      return {
        step: 1,
        exchanges: [],
        trades: [],
        supportedExchanges: ['binance'],
        maritalStatus: null,
        loadingSummary: false,
        headers: [
          { text: 'Description (1a)', align: 'left', value: 'Description'},
          { text: 'Date acquired (1b)', value: 'DateAcquired' },
          { text: 'Date sold (1c)', value: 'DateSoldDisposed' },
          { text: 'Proceeds (1d)', value: 'SalesPriceUsd' },
          { text: 'Cost basis (1e)', value: 'CostBasis' },
          { text: 'Gain or loss (1h)', value: 'GainLoss' }
        ],
        excelHeaders: {
          'Description of property (1a)': 'Description',
          'Date acquired (1b)': 'DateAcquired',
          'Date sold or disposed of (1c)': 'DateSoldDisposed',
          'Proceeds (1d)': 'SalesPriceUsd',
          'Cost or other basis (1e)': 'CostBasis',
          'Gain or loss (1h)': 'GainLoss'
        },
        Totals: {"TotalGainLoss": -11324 },
        "ShortTermTransactions": [
          {
            "OrderUuid": "fd97d393-e9b9-4dd1-9dbf-f288fc72a185",
            "Description": "1000 XRP",
            "DateAcquired": 1460663058,
            "DateSoldDisposed": 1507999458,
            "SalesPriceUsd": 656,
            "CostBasis": 221,
            "GainLoss": -435
          },
          {
            "OrderUuid": "ad97d393-e9b9-4dd1-9dbf-f288fc72a111",
            "Description": "0.1 BTC",
            "DateAcquired": 1457507298,
            "DateSoldDisposed": 1495376418,
            "SalesPriceUsd": 809,
            "CostBasis": 1813,
            "GainLoss": 1004
          },
          {
            "OrderUuid": "fd97d393-e9b9-4dd1-9dbf-f288fc72a181",
            "Description": "100 XRP",
            "DateAcquired": 1460662058,
            "DateSoldDisposed": 1507997458,
            "SalesPriceUsd": 75,
            "CostBasis": 221,
            "GainLoss": 146
          },
          {
            "OrderUuid": "ad97d393-e9b9-4dd1-9dbf-f288fc72a112",
            "Description": "1 BTC",
            "DateAcquired": 1457517298,
            "DateSoldDisposed": 1495366418,
            "SalesPriceUsd": 8090,
            "CostBasis": 18130,
            "GainLoss": 10040
          },
          {
            "OrderUuid": "fd97d393-e9b9-4dd1-9dbf-f288fc72a183",
            "Description": "1000 XRP",
            "DateAcquired": 1460653058,
            "DateSoldDisposed": 1507989458,
            "SalesPriceUsd": 656,
            "CostBasis": 221,
            "GainLoss": 435
          },
          {
            "OrderUuid": "ad97d393-e9b9-4dd1-9dbf-f288fc72a114",
            "Description": "0.1 BTC",
            "DateAcquired": 1457517298,
            "DateSoldDisposed": 1495356418,
            "SalesPriceUsd": 809,
            "CostBasis": 1813,
            "GainLoss": 1004
          }
        ],
        "LongTermTransactions": [
          {
            "OrderUuid": "fd97d393-e9b9-4dd1-9dbf-f288fc72a185",
            "Description": "1000 XRP",
            "DateAcquired": 1460663058,
            "DateSoldDisposed": 1507999458,
            "SalesPriceUsd": 656,
            "CostBasis": 221,
            "GainLoss": 435
          },
          {
            "OrderUuid": "ad97d393-e9b9-4dd1-9dbf-f288fc72a111",
            "Description": "0.1 BTC",
            "DateAcquired": 1457507298,
            "DateSoldDisposed": 1495376418,
            "SalesPriceUsd": 809,
            "CostBasis": 1813,
            "GainLoss": -1004
          },
          {
            "OrderUuid": "fd97d393-e9b9-4dd1-9dbf-f288fc72a181",
            "Description": "100 XRP",
            "DateAcquired": 1460662058,
            "DateSoldDisposed": 1507997458,
            "SalesPriceUsd": 75,
            "CostBasis": 221,
            "GainLoss": -146
          },
          {
            "OrderUuid": "ad97d393-e9b9-4dd1-9dbf-f288fc72a112",
            "Description": "1 BTC",
            "DateAcquired": 1457517298,
            "DateSoldDisposed": 1495366418,
            "SalesPriceUsd": 8090,
            "CostBasis": 18130,
            "GainLoss": -10040
          },
          {
            "OrderUuid": "fd97d393-e9b9-4dd1-9dbf-f288fc72a183",
            "Description": "1000 XRP",
            "DateAcquired": 1460653058,
            "DateSoldDisposed": 1507989458,
            "SalesPriceUsd": 656,
            "CostBasis": 221,
            "GainLoss": 435
          },
          {
            "OrderUuid": "ad97d393-e9b9-4dd1-9dbf-f288fc72a114",
            "Description": "0.1 BTC",
            "DateAcquired": 1457517298,
            "DateSoldDisposed": 1495356418,
            "SalesPriceUsd": 809,
            "CostBasis": 1813,
            "GainLoss": -1004
          }
        ],
        "Summary": {
          "ReportPeriod": "Tax Year 2017",
          "TotalShortTermGainLoss": 1324,
          "TotalLongTermGainLoss": -11324
        }
      }
    },
    methods: {
      addExchange: function (exchange) {
        if (!this.exchanges.map((exchange) => { return exchange.name }).includes(exchange)) {
          this.exchanges.push({name: exchange})
        }
      },
      addTrade: function () {
        this.trades.push({})
      },
      calculateTaxes: function () {
        this.loadingSummary = true
        new Promise((resolve, reject) => {
          console.log("crunching the numbers...")
          /*axios.post("/api/getSummary", {
            exchanges: this.exchanges,
            trades: this.trades
          }).then((res) => {
            resolve(res)
          })*/ //TODO
          setTimeout(function () {
            resolve()
          }, 2000)
        }).then(() => {
          this.loadingSummary = false
          this.step = 3
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    computed: {
      ShortTermTransactionsFormatted: function () {
        return this.ShortTermTransactions.map(function (transaction) {
          transaction.DateAcquired = moment.unix(transaction.DateAcquired).format("MM,DD,YYYY")
          transaction.DateSoldDisposed = moment.unix(transaction.DateSoldDisposed).format("MM,DD,YYYY")
          return transaction
        })
      },
      LongTermTransactionsFormatted: function () {
        return this.LongTermTransactions.map(function (transaction) {
          transaction.DateAcquired = moment.unix(transaction.DateAcquired).format("MM,DD,YYYY")
          transaction.DateSoldDisposed = moment.unix(transaction.DateSoldDisposed).format("MM,DD,YYYY")
          return transaction
        })
      },
      TradesToPost: function () {
        return this.trades.map(function (trade) {
          trade.timestamp = moment(trade.timestamp, "M/D/YYYY H:mm").valueOf()
          return trade
        })
      }
    },
    name: 'App'
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  th {
    word-wrap: break-word;
  }
</style>
