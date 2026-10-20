import lighthouse from "lighthouse"
import * as chromeLauncher from "chrome-launcher"
import { chromium } from "@playwright/test"
import fs from "fs"
import path from "path"

const TARGET_URL = process.env.TARGET_URL || "http://localhost:4173"
const NUM_RUNS = 3

const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  "best-practices": 90,
  seo: 90,
}

async function runLighthouse(chromePath, runIndex) {
  console.log(`\n▶ Rodada ${runIndex + 1}/${NUM_RUNS} executando auditoria em ${TARGET_URL}...`)

  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
  })

  try {
    const options = {
      logLevel: "silent",
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
      formFactor: "desktop",
      screenEmulation: {
        mobile: false,
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttlingMethod: "provided",
    }

    const runnerResult = await lighthouse(TARGET_URL, options)
    const categories = runnerResult.lhr.categories
    if (!categories) {
      console.error("Sem categorias no lhr:", runnerResult.lhr.runtimeError)
      return { performance: 0, accessibility: 0, "best-practices": 0, seo: 0 }
    }

    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      "best-practices": Math.round(categories["best-practices"].score * 100),
      seo: Math.round(categories.seo.score * 100),
    }

    console.log(`  ✓ Performance:       ${scores.performance}`)
    console.log(`  ✓ Acessibilidade:    ${scores.accessibility}`)
    console.log(`  ✓ Melhores Práticas: ${scores["best-practices"]}`)
    console.log(`  ✓ SEO:               ${scores.seo}`)

    return scores
  } finally {
    await chrome.kill()
  }
}

async function main() {
  const chromePath = chromium.executablePath()
  console.log(`=======================================================`)
  console.log(`Auditoria Automatizada Lighthouse - Kurio NFT Marketplace`)
  console.log(`Alvo: ${TARGET_URL}`)
  console.log(`Binário Chromium: ${chromePath}`)
  console.log(`Rodadas consecutivas: ${NUM_RUNS}`)
  console.log(`=======================================================`)

  const allScores = []

  for (let i = 0; i < NUM_RUNS; i++) {
    const scores = await runLighthouse(chromePath, i)
    allScores.push(scores)
  }

  // Média
  const avg = {
    performance: Math.round(allScores.reduce((acc, s) => acc + s.performance, 0) / NUM_RUNS),
    accessibility: Math.round(allScores.reduce((acc, s) => acc + s.accessibility, 0) / NUM_RUNS),
    "best-practices": Math.round(allScores.reduce((acc, s) => acc + s["best-practices"], 0) / NUM_RUNS),
    seo: Math.round(allScores.reduce((acc, s) => acc + s.seo, 0) / NUM_RUNS),
  }

  console.log(`\n=======================================================`)
  console.log(`Resultados Consolidados (Média das ${NUM_RUNS} rodadas):`)
  console.log(`Performance:        ${avg.performance} (Meta: ≥ ${THRESHOLDS.performance})`)
  console.log(`Acessibilidade:     ${avg.accessibility} (Meta: ≥ ${THRESHOLDS.accessibility})`)
  console.log(`Melhores Práticas:  ${avg["best-practices"]} (Meta: ≥ ${THRESHOLDS["best-practices"]})`)
  console.log(`SEO:                ${avg.seo} (Meta: ≥ ${THRESHOLDS.seo})`)
  console.log(`=======================================================`)

  const resultsDir = path.resolve(process.cwd(), "test-results")
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  const reportPath = path.join(resultsDir, "lighthouse-summary.json")
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        target: TARGET_URL,
        runs: allScores,
        average: avg,
        thresholds: THRESHOLDS,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  )

  console.log(`\nRelatório salvo com sucesso em: ${reportPath}`)
}

main().catch((err) => {
  console.error("Erro na auditoria Lighthouse:", err)
  process.exit(1)
})
