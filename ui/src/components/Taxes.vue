<template>
  <v-container fluid color="grey darken-3" class="pt-5">
    <v-stepper v-model="step" vertical>
      <v-stepper-step step="1" :complete="step > 1">
        Input your crypto history
        <small>Tell us about the crypto you have bought and sold</small>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-card color="grey darken-2" class="mb-5">
          <v-card-title primary-title>
            <div>
              BlockTax can automatically grab your previous trades<br/>
            </div>
          </v-card-title>
          <v-card-text>
            <v-list v-if="exchanges.length > 0" two-line>
              <template v-for="(item, index) in exchanges">
                <v-list-tile ripple :key="item" @click="">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="item"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="item"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
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
        <v-card color="grey darken-2" class="mb-5">
          <v-card-title>You can also input your trades manually</v-card-title>
          <v-card-text>

          </v-card-text>
        </v-card>
        <v-btn color="primary" @click.native="step = 2">Continue</v-btn>
        <v-btn flat>Cancel</v-btn>
      </v-stepper-content>
      <v-stepper-step step="2" :complete="step > 2">
        Determine your tax bracket
      </v-stepper-step>
      <v-stepper-content step="2">
        <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
        <v-btn color="primary" @click.native="step = 3">Continue</v-btn>
        <v-btn flat>Cancel</v-btn>
      </v-stepper-content>
      <v-stepper-step step="3" :complete="step > 3">
        Do your taxes!
      </v-stepper-step>
      <v-stepper-content step="3">
        <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
        <v-btn color="primary" @click.native="step = 4">Continue</v-btn>
        <v-btn flat>Cancel</v-btn>
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
        supportedExchanges: ['bittrex', 'binance']
      }
    },
    methods: {
      addExchange: function (exchange) {
        if (!this.exchanges.includes(exchange)) {
          this.exchanges.push(exchange)
        }
      }
    },
    name: 'App'
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
