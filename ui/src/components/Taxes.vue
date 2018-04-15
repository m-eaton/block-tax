<template>
  <v-container fluid color="grey darken-3" class="mt-5">
    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1" :complete="step > 1">
        Input your crypto history
        <small>Tell us about the crypto you have bought and sold.</small>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-card hover color="grey darken-2" class="mb-5">
          <v-card-title primary-title>
            <div>
              BlockTax can automatically grab your previous trades<br/>
            </div>
          </v-card-title>
          <v-card-text>
            <v-list v-if="exchanges.length > 0" three-line>
              <template v-for="(item, index) in exchanges">
                <v-list-tile ripple :key="index" @click="">
                  <v-list-tile-content>
                    <v-list-tile-title class="pb-2" v-html="item"></v-list-tile-title>
                    <v-list-tile-sub-title class="pb-1" v-html="item"></v-list-tile-sub-title>
                    <v-list-tile-action>
                      <v-text-field
                        name="apikey"
                        label="enter your api key"
                        id="apikey"
                      ></v-text-field>
                    </v-list-tile-action>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider/>
              </template>
            </v-list>
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
          <v-card-title>You can also input your trades manually</v-card-title>
          <v-card-text>
            <template v-for="(item, index) in trades">
              <v-card hover>
                <v-card-text>
                  <v-text-field
                    class="pb-2"
                    name="exchange"
                    label="exchange"
                    id="exchange"
                    v-model="item.exchange"
                  ></v-text-field>
                  <v-text-field
                    name="coin"
                    label="coin"
                    id="coin"
                    v-model="item.coin"
                  ></v-text-field>
                  <v-text-field
                    mask="#########################"
                    name="amount"
                    label="amount"
                    id="amount"
                    v-model="item.amount"
                  ></v-text-field>
                  <v-text-field
                    mask="##/##/#### ##:##"
                    name="datetime"
                    label="datetime (e.g. 06/18/2017 14:30)"
                    id="datetime"
                    v-model="item.datetime"
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
        <v-btn color="primary" @click.native="step = 2">Continue</v-btn>
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
        <v-btn color="primary" @click.native="calculateTaxes()">Continue</v-btn>
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
              :items="ShortTermTransactions"
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
              :data   = "ShortTermTransactions"
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
              :items="LongTermTransactions"
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
              :data   = "LongTermTransactions"
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
  import VCardTitle from "vuetify/src/components/VCard/VCardTitle";

  export default {
    components: {VCardTitle},
    data () {
      return {
        step: 1,
        exchanges: [],
        trades: [],
        supportedExchanges: ['bittrex', 'binance'],
        maritalStatus: null,
        headers: [
          { text: 'Description of property (1a)', align: 'left', value: 'Description'},
          { text: 'Date acquired (1b)', value: 'DateAcquired' },
          { text: 'Date sold or disposed of (1c)', value: 'DateSoldDisposed' },
          { text: 'Proceeds (1d)', value: 'SalesPriceUsd' },
          { text: 'Cost or other basis (1e)', value: 'CostBasis' },
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
        if (!this.exchanges.includes(exchange)) {
          this.exchanges.push(exchange)
        }
      },
      addTrade: function () {
        this.trades.push({})
      },
      calculateTaxes: function () {
        new Promise((resolve, reject) => {
          console.log("crunching the numbers...")
          this.trades.map
          console.log(this.trades)
          resolve()
        }).then(() => {
          this.step = 3
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    name: 'App'
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
