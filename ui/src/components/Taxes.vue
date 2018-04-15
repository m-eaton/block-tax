<template>
  <v-container fluid color="grey darken-3" class="pt-5">
    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1" :complete="step > 1">
        Input your crypto history
        <small>Tell us about the crypto you have bought and sold</small>
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
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-card hover color="grey lighten-1" class="mb-5" height="200px"></v-card>
        <v-btn flat @click.native="step = 2">Back</v-btn>
      </v-stepper-content>
    </v-stepper>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        step: 1,
        exchanges: [],
        trades: [],
        supportedExchanges: ['bittrex', 'binance'],
        maritalStatus: null
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
