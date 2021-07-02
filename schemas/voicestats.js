const schema = mongoose.Schema({
    userID: String,
    guildID: String,
    voiceStats: {type: Number, default: 0}
});
module.exports = mongoose.model("Voice", schema);