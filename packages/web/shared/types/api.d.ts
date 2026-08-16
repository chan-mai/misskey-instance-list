// import文はグローバル型を失う
type StatsRepository = import('@mil/core/validation').StatsRepository;
type Stats = import('@mil/core/validation').StatsResponse;
type StatsResponse = Stats;

type Instance = import('@mil/core/validation').ApiInstance;
type InstancesResponse = import('@mil/core/validation').InstancesResponse;
type ExclusionResponse = import('@mil/core/validation').ExclusionResponse;
type CheckResponse = import('@mil/core/validation').CheckResponse;
