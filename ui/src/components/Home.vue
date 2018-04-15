<template>
  <div>
    <v-container fluid>
      <v-jumbotron height="100" color="grey darken-3" class="pt-5">
        <v-container>
          <v-layout align-center>
            <v-flex>
              <v-card hover>
                <v-card-title>
                  <div>
                    <h3 class="display-1">Crypto taxes are hard</h3>
                    <span class="subheading">BlockTax makes them easy</span>
                  </div>
                </v-card-title>
                <v-card-text>
                  <v-card hover color="grey darken-2">
                    <v-card-title class="subheading">Disclaimer:</v-card-title>
                    <v-card-text>
                      This project was created at the <a href="https://summit.cublockchain.org/">CU Blockchain Summit</a>.
                      As a hackathon project, its scope is purposefully limited, and its results should not used as financial reporting advice.
                      As an example, we omitted hard forks, airdrops and other zero-base events from our calculations.
                      If BlockTax is useful for you, please consider donating to its future development.
                      You can contribute directly to the BlockTag team by sending bitcoin here: <a href="bitcoin:ourbtcaddress">ourbtcaddress</a>.
                    </v-card-text>
                  </v-card>
                </v-card-text>
                <v-card-actions>
                  <v-btn block color="primary" class="mx-0" to="/taxes">Get Started</v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-jumbotron>
    </v-container>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
