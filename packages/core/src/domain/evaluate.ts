import { resolvePublicAddresses, toIpStack } from '../net/ip.js';
import { getInstanceInfo, type InstanceResult } from '../client/misskey.js';

// 除外理由の先頭語, check APIの判別にも使用
const REJECTION_PREFIX = {
  notMisskey: 'Not Misskey',
  fork: 'Fork Repository',
  spoofing: 'Spoofing',
} as const;

// 手動除外はMisskeyの可能性が残る
export const isConfirmedNonMisskey = (reason: string | null): boolean => {
  const lower = reason?.toLowerCase() || '';
  return Object.values(REJECTION_PREFIX).some((prefix) => lower.includes(prefix.toLowerCase()));
};

/** 検証で不合格となった理由, excludedHostのreasonにそのまま入る */
export type InstanceRejection = {
  reason: string;
};

export type EvaluationResult = InstanceResult & {
  rejection?: InstanceRejection;
};

/**
 * インスタンスの同一性と整合性を検査する, DBへの書き込みは行わない
 *
 * bot相当とブラウザ相当の2つのUser-Agentで取得し, 非Misskey・フォーク・偽装を判定する
 * 不合格の場合は`rejection`に理由を載せて返し, 反映の判断は呼び出し側に委ねる
 *
 * 利用者入力のホストをそのまま接続先にできるため, 冒頭でSSRF対策の名前解決検査を行う
 *
 * @param host - 検査対象のホスト(ドメイン)
 * @returns 成功時はInstanceInfoを含むEvaluationResult, 到達不能・GONE・不合格時は`info: null`
 */
export async function evaluateInstance(
  host: string
): Promise<EvaluationResult> {
  // 生IPや内部名(metadata.google.internal等)への接続を防ぐ
  const addresses = await resolvePublicAddresses(host);
  if (!addresses) {
    return { info: null, error: 'UNKNOWN' };
  }

  const botRes = await getInstanceInfo(host, 'JoinMisskey');

  // Botで既にGONEならBrowserチェックするまでもなくGONE
  if (botRes.error === 'GONE') return botRes;

  // Botでタイムアウトなら、とりあえずタイムアウトとして返す (ブラウザチェック不要)
  // NOTE: ブラウザだと通るケースも考えられるが、クローラーがアクセスできなければ意味がないので
  if (!botRes.info) return botRes;

  const browserRes = await getInstanceInfo(
    host,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const botInfo = botRes.info;
  const browserInfo = browserRes.info; // nullでもOK

  const FORK_PATTERNS = [
    'type4ny',
    'firefish',
    'calckey',
    'foundkey',
    'cherrypick',
    'sharkey',
    'rumisskey',
    'iceshrimp',
    'catodon',
    'vickey',
  ];

  if (botInfo) {
    const botSoftware = botInfo.softwareName?.toLowerCase() || '';
    const repoUrl = botInfo.repositoryUrl?.toLowerCase() || '';

    // Misskey以外は除外
    if (botSoftware !== 'misskey' && botSoftware !== '') {
      console.log(`Detected non-misskey software for ${host}: ${botSoftware}`);
      return {
        info: null,
        error: 'UNKNOWN',
        rejection: { reason: `${REJECTION_PREFIX.notMisskey}: ${botSoftware}` },
      };
    }

    // リポジトリURLによるフォーク判定
    // MetaとNodeInfo両方のURLをチェックする
    const urlsToCheck = [
      repoUrl,
      botInfo.nodeinfoRepositoryUrl?.toLowerCase(),
      botInfo.metaRepositoryUrl?.toLowerCase(),
      browserInfo?.nodeinfoRepositoryUrl?.toLowerCase(),
      browserInfo?.metaRepositoryUrl?.toLowerCase(),
    ].filter(Boolean) as string[];

    if (urlsToCheck.length > 0) {
      const detectedForkUrl = urlsToCheck.find((url) =>
        FORK_PATTERNS.some((pattern) => url.includes(pattern))
      );
      if (detectedForkUrl) {
        console.log(`Detected fork repository for ${host}: ${detectedForkUrl}`);
        return {
          info: null,
          error: 'UNKNOWN',
          rejection: { reason: `${REJECTION_PREFIX.fork}: ${detectedForkUrl}` },
        };
      }
    }
  }

  if (botInfo && browserInfo) {
    const botSoftware = botInfo.softwareName?.toLowerCase() || '';
    const browserSoftware = browserInfo.softwareName?.toLowerCase() || '';

    // JoinMisskey相手にはMisskeyを返すが、ブラウザにはそれ以外 (かつEmptyでない)を返す場合
    if (
      botSoftware === 'misskey' &&
      browserSoftware !== 'misskey' &&
      browserSoftware !== ''
    ) {
      console.log(
        `Detected spoofing/fork behavior for ${host}: Bot=${botSoftware}, Browser=${browserSoftware}`
      );
      return {
        info: null,
        error: 'UNKNOWN',
        rejection: {
          reason: `${REJECTION_PREFIX.spoofing}: JoinMisskey=${botSoftware}, Browser=${browserSoftware}`,
        },
      };
    }
  }

  // 問題なければBotの情報を返す
  return { ...botRes, info: { ...botRes.info, ipStack: toIpStack(addresses) } };
}

