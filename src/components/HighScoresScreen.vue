<template>
  <div class="high-scores">
    <div class="high-scores-wrapper">
      <h1 class="high-scores-title">High Scores</h1>

      <div class="high-scores-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ selected: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >{{ tab.label }}</button>
      </div>

      <div class="high-scores-table-wrap">
      <div class="high-scores-table-container" ref="tableContainer">
        <table v-if="displayedScores.length > 0" class="high-scores-table">
          <colgroup>
            <col class="col-rank" />
            <col class="col-name" />
            <col class="col-score" />
            <col v-if="activeTab === null" class="col-diff" />
            <col class="col-time" />
            <col class="col-boards" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th class="name-cell">Name</th>
              <th>Score</th>
              <th v-if="activeTab === null"><span class="diff-full">Difficulty</span><span class="diff-short">Diff.</span></th>
              <th>Time</th>
              <th><span class="boards-full">Boards</span><span class="boards-short">#</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in displayedScores" :key="entry.id" :class="{ 'new-entry': entry.id === newEntryId, 'new-entry-animating': entry.id === animatingEntryId }">
              <td class="rank-cell">
                <span v-if="index < 3" :class="rankClass(index)" v-sparkle="{ maxParticles: 2, minInterval: 800, maxInterval: 1600 }">{{ index + 1 }}</span>
                <span v-else>{{ index + 1 }}</span>
              </td>
              <td class="name-cell">{{ entry.name || "(anonymous)" }}</td>
              <td class="score-cell">
                {{ entry.score }}<span v-if="entry.mulliganUsed" class="mulligan-mark" title="Mulligan used">*</span>
              </td>
              <td v-if="activeTab === null"><span class="diff-full">{{ difficultyName(entry.difficulty) }}</span><span class="diff-short">{{ difficultyAbbr(entry.difficulty) }}</span></td>
              <td>{{ entry.timePlayed | gameTime }}</td>
              <td>{{ entry.boardsCleared }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="high-scores-empty">No scores recorded yet.</p>
      </div>
      </div>

      <p v-if="activeTab === null" class="boards-played-stat">
        {{ boardsPlayed }} boards cleared
        <template v-if="confirmingReset">
          <span class="reset-confirm-text">Reset all scores and stats?</span>
          <button class="reset-confirm-yes" @click="confirmReset()">Yes</button>
          <button class="reset-stats-link" @click="confirmingReset = false">No</button>
        </template>
        <button v-else class="reset-stats-link" @click="confirmingReset = true">reset stats</button>
      </p>

      <button class="high-scores-back" @click="returnToMainMenu()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Main Menu</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Highscores from "../game/highscores";
import "../directives/sparkle";

const DIFFICULTY_NAMES = ["Easy", "Medium", "Hard"];

export default {
  computed: {
    ...mapState(["highScoresInitialDifficulty"]),
    displayedScores() {
      // refreshKey is a reactive dependency so reset triggers re-read from storage
      // eslint-disable-next-line no-unused-expressions
      this.refreshKey;
      return Highscores.getTopScores(this.activeTab, 10);
    },
  },
  data() {
    return {
      activeTab: 0,
      newEntryId: null,
      animatingEntryId: null,
      boardsPlayed: Highscores.getBoardsPlayed(),
      confirmingReset: false,
      refreshKey: 0,
      tabs: [
        { label: "Easy", value: 0 },
        { label: "Medium", value: 1 },
        { label: "Hard", value: 2 },
        { label: "All", value: null },
      ],
    };
  },
  mounted() {
    // Open to the difficulty tab specified (e.g. after saving a new score)
    if (this.highScoresInitialDifficulty !== null && this.highScoresInitialDifficulty !== undefined) {
      this.activeTab = this.highScoresInitialDifficulty;
    }
    // Highlight the most recently added entry
    const scores = Highscores.load().scores;
    if (scores.length > 0) {
      const newest = scores.reduce((a, b) =>
        new Date(a.date) > new Date(b.date) ? a : b
      );
      this.newEntryId = newest.id;
      this.animatingEntryId = newest.id;
    }
    this._onAnimationEnd = (e) => {
      if (e.animationName === 'new-entry-flash') {
        this.animatingEntryId = null;
      }
    };
    this.$refs.tableContainer.addEventListener('animationend', this._onAnimationEnd);
  },
  beforeDestroy() {
    if (this.$refs.tableContainer) {
      this.$refs.tableContainer.removeEventListener('animationend', this._onAnimationEnd);
    }
  },
  methods: {
    rankClass(index) {
      return ["rank-gold", "rank-silver", "rank-bronze"][index] || "rank-plain";
    },
    difficultyName(difficulty) {
      return DIFFICULTY_NAMES[difficulty] || "?";
    },
    difficultyAbbr(difficulty) {
      return ["E", "M", "H"][difficulty] || "?";
    },
    confirmReset() {
      Highscores.resetAll();
      this.boardsPlayed = 0;
      this.refreshKey++;
      this.confirmingReset = false;
    },
    returnToMainMenu() {
      this.$store.dispatch("closeHighScores");
      this.$store.dispatch("gameInactive");
    },
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes new-entry-flash {
    0%   { opacity: 0; }
    50%  { opacity: 1; }
    100% { opacity: 0; }
  }

  .high-scores {
    @include backdrop-container;
    z-index: 102;
    font-family: $font-display;
    user-select: none;
    overflow-y: auto;

    .high-scores-wrapper {
      @include menu-wrapper;
      height: auto;
      min-height: 75%;
      max-height: calc(100% - 40px);
      overflow-y: auto;

      @media screen and (min-height: 800px) {
        min-height: 60%;
      }
      @media screen and (min-height: 960px) {
        min-height: 50%;
      }

      .high-scores-title {
        font-size: 40px;
        color: $color-text-primary;
        text-transform: uppercase;
        margin-bottom: 20px;

        @media screen and (max-width: 1024px) {
          font-size: 28px;
        }
      }

      .high-scores-tabs {
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 6px;

        button {
          @include tab-button-gray;
          font-size: 18px;
          padding: 8px 18px;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3) inset, 0px 0px 5px rgba(0, 0, 0, 1) inset;

          &.selected {
            @include tab-button-green-selected;
          }
        }
      }

      .high-scores-table-wrap {
        margin-bottom: 20px;
        overflow: hidden;
      }

      .high-scores-table-container {
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .high-scores-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 16px;
        text-align: left;

        @media screen and (max-width: 700px) {
          font-size: 13px;
        }

        col.col-rank   { width: 48px; }
        col.col-score  { width: 72px; }
        col.col-diff   { width: 80px; }
        @media screen and (max-width: 850px) {
          col.col-diff { width: 36px; }
        }
        col.col-time   { width: 72px; }
        col.col-boards { width: 68px; }
        @media screen and (max-width: 850px) {
          col.col-boards { width: 36px; }
        }

        thead tr {
          border-bottom: 1px solid rgba(37, 21, 19, 0.3);

          th {
            color: rgba(37, 21, 19, 0.6);
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            padding: 4px 8px 8px;
          }
        }

        tbody tr {
          border-bottom: 1px solid rgba(0, 0, 0, 0.15);

          &:last-child {
            border-bottom: none;
          }

          td {
            padding: 7px 8px;
            color: $color-text-primary;
          }

          &.new-entry-animating td {
            &::after {
              content: ' ';
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background: #f7f79a;
              opacity: 0;
              animation: new-entry-flash 2s ease-in-out 1;
            }
          }

          &.new-entry td {
            position: relative;
            background: #cccc0a;
            box-shadow: 0px 0px 10px rgba(120, 120, 11, 0.8) inset;

            &:first-child { border-left: 1px solid rgba(0, 0, 0, 0.15); }
            &:last-child  { border-right: 1px solid rgba(0, 0, 0, 0.15); }

            &::before {
              content: ' ';
              position: absolute;
              left: 5px;
              top: 3px;
              width: 10px;
              height: 6px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
          }
        }

        .boards-short, .diff-short { display: none; }

        @media screen and (max-width: 850px) {
          .boards-full, .diff-full { display: none; }
          .boards-short, .diff-short { display: inline; }
        }

        .name-cell {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rank-cell {
          text-align: center;
          width: 40px;
        }

        .rank-gold, .rank-silver, .rank-bronze {
          position: relative;
          display: inline-block;
          font-weight: bold;
          width: 26px;
          line-height: 26px;
          z-index: 0;

          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 26px;
            height: 26px;
            border-radius: 50%;
            z-index: -1;
          }
        }

        .rank-gold::before   { background: radial-gradient(circle at 25% 25%, rgb(218, 182, 80) 0%, rgb(218, 182, 80) 5%, rgb(200, 160, 20) 5%, rgb(140, 105, 5) 80%, rgb(200, 160, 20) 100%);  border: 1px solid rgb(150, 118, 10);  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3); }
        .rank-silver::before { background: radial-gradient(circle at 25% 25%, rgb(185, 185, 192) 0%, rgb(185, 185, 192) 5%, rgb(160, 160, 168) 5%, rgb(100, 100, 110) 80%, rgb(160, 160, 168) 100%); border: 1px solid rgb(115, 115, 122); box-shadow: 0 0 4px rgba(0, 0, 0, 0.3); }
        .rank-bronze::before { background: radial-gradient(circle at 25% 25%, rgb(200, 138, 86) 0%, rgb(200, 138, 86) 5%, rgb(176, 112, 56) 5%, rgb(115, 68, 28) 80%, rgb(176, 112, 56) 100%);  border: 1px solid rgb(132, 82, 36);   box-shadow: 0 0 4px rgba(0, 0, 0, 0.3); }

        .score-cell {
          white-space: nowrap;
        }

        .mulligan-mark {
          color: rgb(200, 160, 0);
          cursor: help;
          margin-left: 2px;
        }
      }

      .high-scores-empty {
        color: $color-text-primary;
        font-size: 18px;
        margin: 30px 0;
      }

      .boards-played-stat {
        color: $color-text-primary;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 16px;
        opacity: 0.7;

        .reset-stats-link {
          background: none;
          border: none;
          padding: 0;
          margin-left: 10px;
          font-family: $font-display;
          font-size: 14px;
          font-weight: normal;
          color: $color-text-primary;
          text-decoration: underline;
          cursor: pointer;

          &:hover, &:focus {
            opacity: 1.5;
          }
        }

        .reset-confirm-text {
          margin-left: 10px;
          font-weight: normal;
          font-size: 14px;
        }

        .reset-confirm-yes {
          background: none;
          border: none;
          padding: 0;
          margin-left: 8px;
          font-family: $font-display;
          font-size: 14px;
          font-weight: bold;
          color: $color-text-primary;
          text-decoration: underline;
          cursor: pointer;

          &:hover, &:focus {
            color: rgb(160, 0, 0);
          }
        }
      }

      .high-scores-back {
        @include gloss-button-blue;
        margin-top: 10px;
      }
    }
  }
</style>
