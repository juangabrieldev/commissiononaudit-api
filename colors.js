const _ = require('lodash');

const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#7f8c8d'];

const generate = () => _.sample(colors);

module.exports = generate;