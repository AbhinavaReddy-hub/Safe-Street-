// server/services/priorityService.js

/**
 * Severity weight mapping: low=1, medium=2, high=3
 */
const severityWeight = { low: 1, medium: 2, high: 3 };

/**
 * Damage type weight mapping: patch=1, crack=2, pothole=3
 */
const typeWeight     = { patch: 1, crack: 2, pothole: 3 };

/**
 * Compute a priority score given:
 * - severity (string)
 * - damageType (string)
 * - trafficScore (number)
 * - confidenceScore (number, 0–1)
 * - weights { wTraffic, wSeverity, wType, wConf }
 *
 * Formula:
 *   priority =
 *     wTraffic * trafficScore +
 *     wSeverity * severityWeight[severity] +
 *     wType    * typeWeight[damageType] +
 *     wConf    * confidenceScore
 */
function computePriority(
  { severity, damageType, trafficScore, confidenceScore },
  {
    wTraffic  = 0.35,
    wSeverity = 0.35,
    wType     = 0.2,
    wConf     = 0.1
  } = {}
) {
  const sW = severityWeight[severity] ?? 1;
  const tW = typeWeight[damageType]   ?? 1;
  const cW = typeof confidenceScore === 'number' ? confidenceScore : 0;

  return (
    wTraffic  * trafficScore +
    wSeverity * sW +
    wType     * tW +
    wConf     * cW
  );
}

module.exports = { computePriority };
// Quick local test when running this file directly
if (require.main === module) {
    const score = computePriority(
      {
        severity: 'high',
        damageType: 'patch',
        trafficScore: 1.9,
        confidenceScore: 0.83
      },
      {
        wTraffic: 0.35,
        wSeverity: 0.35,
        wType: 0.2,
        wConf: 0.1
      }
    );
    console.log('Priority Score:', score.toFixed(2));
  }
  