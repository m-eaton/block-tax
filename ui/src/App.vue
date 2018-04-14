<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title><a href="/">BlockTax</a></v-toolbar-title>
    </v-toolbar>
    <v-container>
      <router-view></router-view>
    </v-container>
    <v-footer fixed app>
      <v-spacer/>
      <span>&copy; BlockTax 2018</span>
      <v-spacer/>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  name: 'App'
}
</script>

<style>
  * {
    font-family: 'Inconsolata', monospace;
  }
</style>
