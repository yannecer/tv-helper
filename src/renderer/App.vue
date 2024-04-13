<template>
    <div id="app">
        <tv-helper></tv-helper>
    </div>
</template>

<script>

import TvHelper from "./components/TvHelper.vue";
import {app} from 'electron'
export default {

    components: {
        TvHelper
    },

    created() {
    },
    methods:{
    }
}
</script>

<style>
/* CSS */

body{
    background-color: #f2f2f2;
}

</style>
