<template>
  <div class="new-high-score">
    <h2 class="new-high-score-title">New High Score!</h2>
    <table class="new-high-score-stats">
      <tr>
        <th scope="row">Score</th>
        <td>{{ score }}</td>
      </tr>
      <tr>
        <th scope="row">Difficulty</th>
        <td>{{ difficultyName }}</td>
      </tr>
      <tr>
        <th scope="row">Time Spent Playing</th>
        <td>{{ timeAccumulator | gameTime }}</td>
      </tr>
      <tr>
        <th scope="row">Longest Run Without Discard</th>
        <td>{{ maxRun }}</td>
      </tr>
      <tr>
        <th scope="row">Boards Cleared</th>
        <td>{{ boardsCleared }}</td>
      </tr>
    </table>
    <div class="new-high-score-name">
      <label for="flamel-hs-player">Your name</label>
      <input
        id="flamel-hs-player"
        type="text"
        v-model="playerName"
        maxlength="32"
        autocomplete="off"
        spellcheck="false"
        data-1p-ignore
        data-bwignore="true"
        data-lpignore="true"
        data-form-type="other"
        class="keeper-ignore"
        ref="nameInput"
      />
    </div>
    <div class="new-high-score-actions">
      <button @click="save()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Save</button>
      <button class="main-menu-btn" @click="returnToMainMenu()">Main Menu</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Constants from "../game/constants";
import Highscores from "../game/highscores";

export default {
  computed: {
    ...mapState(["score", "difficulty", "timeAccumulator", "maxRun", "level"]),
    difficultyName() {
      const names = ["Easy", "Medium", "Hard"];
      return names[this.difficulty] || "Unknown";
    },
    boardsCleared() {
      return this.level - Constants.STARTING_LEVELS[this.difficulty];
    },
  },
  data() {
    return {
      playerName: Highscores.getSettings().playerName,
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.nameInput) {
        this.$refs.nameInput.focus();
      }
    });
  },
  methods: {
    returnToMainMenu() {
      this.$store.dispatch("gameInactive");
    },
    save() {
      const entry = {
        name: this.playerName.trim(),
        score: this.score,
        timePlayed: this.timeAccumulator,
        maxRun: this.maxRun,
        boardsCleared: this.boardsCleared,
        mulliganUsed: false,
        difficulty: this.difficulty,
      };
      Highscores.addEntry(entry);
      Highscores.saveSettings({ playerName: this.playerName.trim() });
      this.$store.dispatch("openHighScores", this.difficulty);
      this.$store.dispatch("gameInactive");
    },
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes hs-prompt-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  .new-high-score {
    animation: hs-prompt-in 0.6s ease-out;

    .new-high-score-title {
      font-size: 28px;
      color: $color-text-primary;
      text-transform: uppercase;
      margin-bottom: 16px;

      @media screen and (max-width: 1024px) {
        font-size: 22px;
      }
    }

    .new-high-score-stats {
      width: 80%;
      margin: 0 auto 16px;
      text-align: left;
      font-size: 16px;

      th {
        color: $color-text-primary;
        font-weight: normal;
        padding: 4px 0;
      }
      td {
        color: $color-text-primary;
        padding: 4px 0;
        text-align: right;
      }
    }

    .new-high-score-name {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 16px;
        color: $color-text-primary;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      input {
        font-family: $font-display;
        font-size: 20px;
        padding: 8px 14px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.4);
        color: rgba(255, 255, 255, 0.9);
        width: 240px;
        text-align: center;
        outline: none;

        &:focus {
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .new-high-score-actions {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 10px;

      button {
        @include gloss-button-blue;
      }
    }
  }
</style>
