# Consumer App Benchmark

**Checked:** 2026-10-25. This review used publicly accessible official product/help pages and newsroom material. It did not use signed-in banking, dating, or social accounts; location-specific app screens, experiments, notification timing, and paywalled features are therefore not verified. Some official sites block automated access, noted below. Links are supplied in place of screenshots.

## Findings

| Product | Official material checked | Observed pattern | CareerForge decision |
|---|---|---|---|
| Monzo | [Monzo account page](https://monzo.com/) | The current public page leads with concrete money jobs such as salary organisation and savings Pots, instead of exposing the full feature inventory first. | Adopt a clear “one useful next step” hierarchy and goal progress tied to a real user-set goal. Avoid copying product claims or assuming a UK banking feature fits South African needs. |
| FNB | [FNB personal banking](https://www.fnb.co.za/) | Public navigation is organized around everyday tasks and account needs. Signed-in home screen, insights and notification timing were not inspected. | Keep primary tasks recognizable and make settings/consent easy to reach. Do not infer spending or income behaviour. |
| Discovery Bank | [Discovery Bank](https://www.discovery.co.za/bank/) | The public product entry point is accessible, but the authenticated app and Vitality reward mechanics could not be verified from this environment. | Use opt-in, explainable progress only. Do not import competitive or financially pressuring reward loops without direct product review. |
| Capitec | [Capitec](https://www.capitecbank.co.za/) | The site returned an automated security challenge (HTTP 403); no current in-app behavior was verified. | No feature borrowed pending direct review. |
| Revolut | [Revolut](https://www.revolut.com/) | The product site/help pages returned an automated security challenge (HTTP 403). | No feature borrowed pending direct review. |
| Hinge | [Hinge](https://hinge.co/) | The official page describes the product as “designed to be deleted” and foregrounds intentional connections over endless retention. Public landing material, not a signed-in matching screen, was inspected. | Adopt purposeful shortlists and progress toward leaving the tool for a real-world outcome. Avoid treating engagement time as success. |
| Bumble | [Bumble](https://bumble.com/) | The public page frames the product around user-directed connections and multiple ways to connect. Signed-in profile prompts and current matching UI were not inspected. | Keep user control and clear next actions. Avoid copying match mechanics without verified evidence. |
| Duolingo | [Duolingo Blog](https://blog.duolingo.com/) | The current official blog is accessible and focuses on learning science and accessible education. The individual streak URLs tested during this check were unavailable, so streak-rest-day mechanics were not verified here. | Use optional, forgiving milestones tied to actual user activity; no loss/shame copy and no streak by default. |
| Spotify Wrapped | [Spotify Wrapped newsroom archive](https://newsroom.spotify.com/tag/spotify-wrapped/) | The official newsroom archive is accessible. The 2026 annual recap had not yet been published on the audit date. A current personalized product flow was not available for inspection. | Adopt the shareable, user-controlled “look what I did” format only with a preview and explicit field-by-field sharing choice. Never expose employer, salary, contact or location by default. |
| Strava | [Strava subscription features](https://www.strava.com/features) | The current public page presents activity features and goals/progress as a coherent subscription product. Signed-in challenge feed and notification behavior were not inspected. | Tie progress displays to concrete actions and keep a private-by-default model. Avoid leaderboards or comparison as the default. |

## Patterns to adopt

1. **Put one useful action first.** The Today screen should give one evidence-backed next step, with the rest of the plan available below it.
2. **Explain recommendations.** Each suggestion should name the profile fact, saved action, or verified listing that caused it.
3. **Use small steps.** Ask for one optional detail only when it changes a visible match or tool result; allow skip/not-now and reuse confirmed information.
4. **Celebrate completion, not time spent.** Use milestones for actions the learner actually completed; make streaks opt-in and forgiving.
5. **Make sharing deliberate.** Preview share cards and let the user choose nickname and achievement fields; default to no exact employer, salary, address, or contact details.
6. **Keep privacy and control close.** Make “why this?”, pause, edit, export, and delete controls discoverable where personalisation appears.

## Patterns to avoid

- Infinite feeds, artificial scarcity, fake deadline urgency, repeated push prompts, guilt language, or rewards that depend on daily retention.
- Unexplained match scores or inferred personal traits that the user cannot see, correct, or remove.
- Public leaderboards and share cards that reveal employment, money, location, or contact data by default.
- Treating a marketing page as proof of signed-in product behavior. Bank/dating app flows need direct account-based review before borrowing details.
