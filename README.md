# VelaCharts

Vela, a Vega-compatible visualization runtime written in
[Ranger](https://github.com/terotests/Ranger): a Vega or Vega-Lite
specification in, a scene, SVG or EVG drawing out, on every Ranger target.
[`vela/README.md`](vela/README.md) describes the runtime, its parity with
official Vega and what is not there yet; [`vela/CHART_API.md`](vela/CHART_API.md)
is the chart API.

The [site](https://terotests.github.io/VelaCharts/) is the page you paste a
specification into and the [chart API reference](https://terotests.github.io/VelaCharts/api/),
built from `main` by `.github/workflows/deploy-pages.yml`.

Vela was developed in Ranger's `gallery/vela` until it moved here, with its
history.

## Layout

| Path | |
| --- | --- |
| `vela/` | The package `vela` (`vela/ranger.json`, entry `src/VlChart.rgr`): sources, tests, goldens, tools, the paste-a-specification page |
| `scripts/ranger.mjs` | Runs Ranger's `vela:*` scripts against this working tree |

## How Ranger uses it

Ranger's root `ranger.json` pins this repository at one commit (subdir
`vela`). `npm ci` in Ranger runs `npm run deps`, which fetches that commit and
puts it at `gallery/vela`, so the gallery projects that import
`../../vela/src/...` and the `/vela/` page of the Ranger site build from it
unchanged.

## Developing

Vela's build and test scripts run from the root of a Ranger checkout: they
use its compiler, and `src/VlEvgList.rgr` and `tools/vela_targets.rgr` import
Ranger's `gallery/game_engine` and `gallery/pdf_writer`. Keep a Ranger
checkout beside this one (or point `RANGER_ROOT` at it), with `npm ci` run
there:

```sh
git clone https://github.com/terotests/Ranger.git ../Ranger
(cd ../Ranger && npm ci)

npm test            # unit tests, goldens, parity (Ranger's npm run vela:test)
npm run cpp         # the same goldens through C++
npm run web         # the paste-a-specification page
```

Each script copies `vela/` to the checkout's `gallery/vela`
(`npm run deps -- --from=<this repo>` in Ranger) and runs the matching
`vela:*` script there. The parity steps compare against official Vega; without
`npm install --no-save vega vega-lite` in the Ranger checkout they report that
nothing was compared.

To give Ranger a new Vela: merge here, put the commit in Ranger's
`ranger.json` (`"rev"` of `vela`), run `npm run deps` there and commit
`ranger.json` and `ranger.lock`.

## License

AGPL-3.0-or-later ([LICENSE](LICENSE)). `vela/VEGA_LICENSE` is the Vega
project's BSD-3-Clause notice; see the attribution section of
[`vela/README.md`](vela/README.md).
