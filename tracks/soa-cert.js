const TRACK_SOA_CERT = {
    id: "soa-cert", code: "SOA-CERT", title: "SOA-C03",
    tagline: "SOA-C03 — CloudOps Engineer Associate.",
    blurb: "A condensed cheatsheet, not a full study guide — the exam's five domains (monitoring & performance, reliability, automation, security, networking) for quick review of day-to-day AWS operations, not deep-dive teaching.",
    examGuideUrl: "https://docs.aws.amazon.com/aws-certification/latest/sysops-administrator-associate-03/",
    storageKey: "ops4life:soa-cert", accent: "var(--c-purple)",
    sections: [
      { id: "monitoring-logging", title: "01 · Monitoring, Logging, Analysis, Remediation and Performance Optimization (22%)", color: "var(--c-purple)", items: [
        { id: "d1-metrics-alarms", label: "Metrics, Alarms and Filters", type: "recommended",
          concepts: ["CloudWatch metrics", "Composite alarms", "Metric filters", "Logs Insights", "CloudWatch agent", "CloudTrail", "SNS"], tools: ["CloudWatch", "CloudTrail", "Managed Service for Prometheus", "SNS"],
          description: "CloudWatch metrics/logs/alarms/dashboards, the CloudWatch agent on EC2/ECS/EKS, CloudTrail, Managed Prometheus and SNS notifications.",
          content: `<h3 id="cw-basics">1.1 CloudWatch Metrics, Logs and Alarms</h3><h4>Core Building Blocks</h4><ul>
<li><strong>Metrics</strong>: time-series data points in a namespace with dimensions. Standard resolution = 1 min, high resolution custom metrics = down to 1 s. EC2 basic monitoring = 5 min, detailed = 1 min (paid)</li>
<li><strong>Logs</strong>: log groups &rarr; log streams. Set <strong>retention</strong> (default never expires). Export to S3 or stream to Firehose/OpenSearch/Lambda with <strong>subscription filters</strong></li>
<li><strong>Metric filters</strong>: turn log patterns into metrics (e.g. count <code>ERROR</code>) which alarms can then watch. They only apply to events ingested <em>after</em> creation</li>
<li><strong>Logs Insights</strong>: interactive query language across log groups; <strong>Contributor Insights</strong> finds top-N contributors</li>
<li><strong>Embedded Metric Format (EMF)</strong>: emit metrics from structured logs (Lambda, containers)</li>
</ul><h4>Alarm States and Actions</h4><ul>
<li>States: <code>OK</code>, <code>ALARM</code>, <code>INSUFFICIENT_DATA</code></li>
<li><strong>Treat missing data</strong> setting: <code>notBreaching</code>, <code>breaching</code>, <code>ignore</code>, <code>missing</code> (the default: all-missing data &rarr; <code>INSUFFICIENT_DATA</code>). Wrong choice is a classic cause of alarms stuck in <code>INSUFFICIENT_DATA</code></li>
<li>Actions: SNS topic, Auto Scaling policy, EC2 actions (stop/terminate/reboot/recover), Systems Manager OpsItem/incident, or EventBridge</li>
<li><strong>Composite alarms</strong>: combine alarms with <code>AND/OR/NOT</code> to cut alarm noise; only the composite notifies</li>
<li><strong>Anomaly detection</strong> alarms use an ML band instead of a static threshold; <strong>Metric math</strong> combines metrics (e.g. error rate = errors / requests)</li>
</ul><pre><code>aws cloudwatch put-metric-alarm --alarm-name high-cpu --namespace AWS/EC2 --metric-name CPUUtilization \\
  --dimensions Name=InstanceId,Value=i-0abc --statistic Average --period 300 --evaluation-periods 2 \\
  --threshold 80 --comparison-operator GreaterThanThreshold --alarm-actions arn:aws:sns:us-east-1:111122223333:ops</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>EC2 does <strong>not</strong> publish memory or disk-space metrics by default. Anything about memory, swap, or disk utilisation on EC2 means the <strong>CloudWatch agent</strong>.</p>
</div>
</div><h3 id="cw-agent">1.2 CloudWatch Agent (EC2, ECS, EKS)</h3><ul>
<li>Install via Systems Manager <strong>Run Command</strong> (<code>AWS-ConfigureAWSPackage</code>) or State Manager; store the JSON config in <strong>SSM Parameter Store</strong> to share across fleets</li>
<li>Instance role needs <code>CloudWatchAgentServerPolicy</code> (and <code>AmazonSSMManagedInstanceCore</code> for SSM-managed install)</li>
<li>Collects OS metrics (memory, disk, swap, procstat) and log files; on-premises servers need an IAM user/role via hybrid activation</li>
<li><strong>ECS</strong>: Container Insights (cluster/service/task metrics) via task setting; use <code>awslogs</code> or FireLens log drivers. Fargate has no agent to install</li>
<li><strong>EKS</strong>: <code>amazon-cloudwatch-observability</code> add-on deploys the agent + Fluent Bit as DaemonSets for Container Insights</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>No metrics or logs from a new instance usually means one of: agent not running, missing IAM permissions on the instance profile, or no network path to CloudWatch (private subnet without NAT or VPC endpoint).</p>
</div>
</div><h3 id="cloudtrail">1.3 CloudTrail, Dashboards and Cross-Account Views</h3><ul>
<li><strong>CloudTrail</strong>: who did what (API activity). <em>Management events</em> are on by default (90-day Event history); <em>data events</em> (S3 objects, Lambda invokes) and <em>Insights</em> are opt-in</li>
<li>Create a <strong>trail</strong> (multi-Region, org trail) to deliver to S3/CloudWatch Logs for retention; turn on <strong>log file validation</strong> for tamper evidence. <strong>CloudTrail Lake</strong> gives SQL queries over events</li>
<li><strong>CloudWatch dashboards</strong> are global, can mix Regions, and can be shared with people outside the account via public link, specific emails, or SSO</li>
<li><strong>Cross-account observability</strong> (Observability Access Manager): monitoring accounts view metrics, logs and traces from source accounts</li>
<li><strong>Amazon Managed Service for Prometheus</strong> stores Prometheus metrics for containers and <strong>Amazon Managed Grafana</strong> visualises them; scrape EKS with an AWS managed collector or ADOT</li>
<li><strong>AWS X-Ray</strong> traces requests across services to find latency and error hotspots</li>
</ul><h3 id="sns">1.4 Notifications with SNS</h3><ul>
<li>Topic types: <strong>Standard</strong> (best-effort ordering, at-least-once) and <strong>FIFO</strong> (ordered, deduplicated; subscribers are SQS queues, FIFO for ordering or standard when order is not needed)</li>
<li>Subscribers: email, SMS, HTTP(S), Lambda, SQS, Firehose, mobile push</li>
<li>A service publishing to SNS needs permission in the <strong>topic access policy</strong> (e.g. <code>events.amazonaws.com</code>, <code>cloudwatch.amazonaws.com</code>, <code>s3.amazonaws.com</code>)</li>
<li>SNS encrypted with a KMS CMK: the publisher also needs <code>kms:GenerateDataKey</code>/<code>kms:Decrypt</code>, and the AWS managed <code>aws/sns</code> key cannot be used by CloudWatch/EventBridge</li>
<li>Use <strong>filter policies</strong> to route subset of messages per subscriber and a <strong>DLQ</strong> for failed deliveries</li>
</ul><h4>Exam Scenarios</h4><ul>
<li>Alert at 75% of inter-Region data transfer spend: <strong>AWS Budgets</strong> cost budget filtered to that usage type, with a 75% alert; Cost Anomaly Detection is not a threshold tool</li>
<li>ASG instances only have the agent if the <strong>AMI already contains it</strong> (stock Amazon Linux needs install). It is not an instance-type/architecture issue</li>
<li>Warn when Kinesis shard (or other service) limits near 80%: <strong>Trusted Advisor</strong> service-limit checks + EventBridge/CloudWatch Events. ServiceLens does not track quotas</li>
<li>Agent multi-file config: start with <code>fetch-config</code>, add more with <code>append-config</code>; every file needs a <strong>different file name</strong>, or the append overwrites the earlier one</li>
<li>Alarm on either EC2 check failing: <code>StatusCheckFailed</code> (combined). <code>_Instance</code> and <code>_System</code> are the individual checks</li>
<li>Processing power needed: <code>CPUUtilization</code> (percent of allocated compute in use). <code>CPUProcessPower</code> does not exist</li>
<li>EC2 metrics for each instance: install the <strong>CloudWatch agent</strong> and attach an <strong>IAM role</strong> (CloudWatchAgentServerPolicy) to the instance</li>
<li>Track access to S3 buckets: <strong>S3 server access logging</strong> into a separate log bucket (CloudTrail data events are the API-level alternative)</li>
<li>An alarm stays in <code>ALARM</code> while the metric still breaches (normal). Fix by adjusting the threshold or the treat-missing-data / evaluation settings</li>
<li>EventBridge rule with a <strong>Lambda or SNS target</strong> needs a <strong>resource-based policy</strong> on the target; the rule IAM role is for targets such as Kinesis streams</li>
<li>Network usage per instance: <code>NetworkIn</code> and <code>NetworkOut</code> (sum the Bytes; divide by 300 for 5-minute Bytes/sec)</li>
<li>Scheduled scripts that check endpoints/APIs: <strong>CloudWatch Synthetics canaries</strong></li>
<li>X-Ray: <strong>ALBs add the X-Amzn-Trace-Id header but do not send data to X-Ray</strong> and do not appear as a service-map node</li>
<li>EC2 <strong>status checks are built in and cannot be disabled or deleted</strong>; custom monitoring scripts supplement them</li>
<li>Classic Load Balancer requests dropped (<code>SpilloverCount</code> &gt; 0 = surge queue full): scale the ASG on <strong><code>SurgeQueueLength</code></strong>; a high max means the backends cannot keep up. Access logs and pre-warming do not fix it</li>
<li>One CloudWatch dashboard can show metrics from several Regions: add a graph per Region using the <strong>Region selector</strong> in the console; no dashboard per Region needed</li>
<li>Dashboard as code: export the existing dashboard as JSON and put it in the <code>DashboardBody</code> of an <strong><code>AWS::CloudWatch::Dashboard</code></strong> resource, so every stack/Region gets its own copy</li>
<li>Auto scale on average RAM (not a built-in EC2 metric): push <code>RAMUtilization</code> as a <strong>custom metric</strong> with the CloudWatch agent/script and scale on it</li>
<li>EC2 metrics at 1-minute resolution: enable <strong>detailed monitoring</strong> (basic = 5 min)</li>
<li>Instance hangs at 100% CPU for a long time: <strong>CloudWatch alarm</strong> (100% for 3 periods of 5 min) with an <strong>EC2 reboot action</strong>; no Lambda cron needed</li>
<li>Track a metric every 10 seconds: push a <strong>high-resolution custom metric</strong> (1 s) and use a high-resolution alarm (10 s period). Detailed monitoring is only 1 minute, and support tickets or the console do not change that</li>
<li>p90 latency from a log field: a <strong>metric filter</strong> turns the field into a metric, and percentile statistics work on metrics. Logs Insights is ad hoc, and Contributor Insights ranks contributors, not percentiles</li>
<li>Report on every API call made to ELB (or who called KMS): <strong>CloudTrail</strong>. CloudWatch is performance, CloudTrail is who did what, Config is resource configuration history</li>
<li><strong>Organization trail</strong>: created in the management account and applied to all member accounts. Members see it but cannot change or delete it, and have no access to its S3 logs by default. Object-level S3 actions need <strong>S3 data events</strong></li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" target="_blank" rel="noopener">Amazon CloudWatch – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html" target="_blank" rel="noopener">CloudWatch – Using Amazon CloudWatch alarms</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html" target="_blank" rel="noopener">CloudWatch agent – Collect metrics and logs</a></li>
<li><a href="https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html" target="_blank" rel="noopener">AWS CloudTrail – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/prometheus/latest/userguide/what-is-Amazon-Managed-Service-Prometheus.html" target="_blank" rel="noopener">Amazon Managed Service for Prometheus</a></li>
<li><a href="https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html" target="_blank" rel="noopener">Amazon Managed Grafana</a></li>
<li><a href="https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html" target="_blank" rel="noopener">AWS X-Ray – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/sns/latest/dg/welcome.html" target="_blank" rel="noopener">Amazon SNS – Developer Guide</a></li>
</ul>` },
        { id: "d1-remediation", label: "Remediate with Events and Automation", type: "recommended",
          concepts: ["EventBridge rules", "Event bus", "Input transformer", "SSM Automation", "Runbooks", "Auto-remediation", "DevOps Agent"], tools: ["EventBridge", "Systems Manager Automation", "Lambda", "AWS DevOps Agent", "Kiro"],
          description: "Analyse metrics, route events through EventBridge, run Systems Manager Automation runbooks, and use AI-assisted ops tools (AWS DevOps Agent, Kiro).",
          content: `<h3 id="eventbridge">2.1 EventBridge: Route, Enrich, Deliver</h3><ul>
<li><strong>Event bus</strong>: default (AWS service events), custom, and partner buses. Cross-account/Region delivery by targeting another bus (needs a resource policy on the destination bus)</li>
<li><strong>Rule</strong>: event pattern (JSON match) or schedule (cron/rate). Up to 5 targets per rule: Lambda, SNS, SQS, Step Functions, SSM Automation/Run Command, ECS task, API destination, another bus</li>
<li><strong>Input transformer</strong> reshapes the event before it reaches the target; <strong>EventBridge Pipes</strong> adds filter + enrich (Lambda/API) between a source (SQS, DynamoDB streams, Kinesis) and a target</li>
<li><strong>Archive and replay</strong> re-sends past events; <strong>Scheduler</strong> runs one-off/recurring (cron/rate) invocations at scale with flexible time windows; each target can have a retry policy and a <strong>DLQ</strong></li>
</ul><h4>Troubleshooting Rules That Do Not Fire</h4><ul>
<li>Pattern does not match the real event shape (check <code>source</code>, <code>detail-type</code>, case-sensitive values)</li>
<li>Rule is on the wrong bus or in the wrong Region (many service events are Regional; IAM/Route 53 global events arrive in us-east-1)</li>
<li>Target lacks permission: resource-based policy on Lambda/SNS/SQS, or the rule's IAM role for targets such as Automation or Step Functions</li>
<li>Check the <code>Invocations</code>, <code>FailedInvocations</code> and <code>TriggeredRules</code> CloudWatch metrics and the target DLQ</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>An EC2 state-change or Health event to remediate automatically &rarr; <strong>EventBridge rule &rarr; Lambda or SSM Automation</strong>. A metric threshold &rarr; <strong>CloudWatch alarm</strong> (alarm state changes are also EventBridge events).</p>
</div>
</div><h3 id="ssm-automation">2.2 Systems Manager Automation Runbooks</h3><ul>
<li><strong>Automation</strong> runs <em>runbooks</em> (SSM documents of type <code>Automation</code>) to act on AWS resources: <code>AWS-RestartEC2Instance</code>, <code>AWS-CreateImage</code>, <code>AWS-StopEC2Instance</code>, <code>AWSSupport-TroubleshootSSH</code> and many more</li>
<li>Write custom runbooks in YAML/JSON with steps such as <code>aws:executeAwsApi</code>, <code>aws:runCommand</code>, <code>aws:executeScript</code> (Python/PowerShell), <code>aws:approve</code>, <code>aws:branch</code>, <code>aws:waitForAwsResourceProperty</code></li>
<li>Execute with an <strong>assume role</strong> (service role) so users do not need direct permissions; supports rate/concurrency controls, multi-account and multi-Region execution</li>
<li>Triggers: console, CLI/SDK, EventBridge, CloudWatch alarm, Config rule remediation, Maintenance Windows, Change Manager</li>
</ul><pre><code>aws ssm start-automation-execution --document-name AWS-RestartEC2Instance \\
  --parameters InstanceId=i-0abc123,AutomationAssumeRole=arn:aws:iam::111122223333:role/ssm-auto</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p><strong>Run Command</strong> runs a script on instances; <strong>Automation</strong> orchestrates multi-step workflows on AWS resources (including approvals). Pick Automation when the scenario mentions steps, approvals, or non-instance resources.</p>
</div>
</div><h3 id="ai-ops">2.3 AI-Assisted Operations (new in SOA-C03)</h3><ul>
<li><strong>AWS DevOps Agent</strong>: an always-available agent for production operations. Starts investigating when an alert fires, triages incidents, and gives root cause analysis and mitigation steps; also reviews past incidents to recommend observability, infrastructure and pipeline improvements, and answers natural-language questions about resource health. Integrates with CloudWatch and third-party observability tools, GitHub/GitLab/Azure DevOps, and ServiceNow/PagerDuty/Slack, and reaches custom tools through MCP servers or A2A</li>
<li><strong>Kiro</strong>: AWS agentic AI development tool (IDE, CLI and web) built around spec-driven development: prompts become requirements, designs and tasks that agents implement. The exam guide lists it among tools for analysing metrics and automating remediation</li>
<li><strong>Amazon Bedrock</strong> appears in scope for monitoring AI workloads (invocation logging, CloudWatch metrics for model usage)</li>
<li>Exam focus is the <em>operational pattern</em> (detect &rarr; analyse &rarr; remediate through approved runbooks and least-privilege roles), not model internals</li>
</ul><h4>Exam Scenarios</h4><ul>
<li>Snapshots every few minutes: a scheduled <strong>EventBridge (CloudWatch Events)</strong> rule can create them; today also consider <strong>Data Lifecycle Manager</strong> / AWS Backup. Snapshots are incremental</li>
<li>Email on every EC2 launch: <strong>EventBridge rule</strong> on EC2 instance state change &rarr; <strong>SNS topic</strong> with email subscription. Simplest, event driven, no CloudTrail metric filters</li>
<li>Check S3 logging is enabled and fix it automatically: <strong>AWS Config rule</strong> (s3-bucket-logging-enabled) with remediation</li>
<li>Recover an impaired instance with Systems Manager Automation: <strong>AWSSupport-ExecuteEC2Rescue</strong></li>
<li>Patch fleets quickly and consistently: <strong>Systems Manager Patch Manager</strong></li>
<li>A DynamoDB (or other service) event hits your resources: check the <strong>AWS Health Dashboard (Personal Health Dashboard)</strong> first for the affected resources and remediation guidance; the Service Health Dashboard is only the general status</li>
<li>Health notifications missing for member accounts under one payer: enable <strong>AWS Health organizational view</strong> via Organizations. Health events are per account by default</li>
<li>Restart the web server when a log error appears: CloudWatch agent sends logs to CloudWatch Logs, a <strong>metric filter</strong> feeds an <strong>alarm</strong>, and an <strong>EventBridge</strong> rule on the alarm starts an <strong>SSM Automation</strong> runbook. SNS cannot start Automation directly, ELB health checks do not read log files, and Logs Insights scheduled queries add delay</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" target="_blank" rel="noopener">Amazon EventBridge – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-troubleshooting.html" target="_blank" rel="noopener">EventBridge – Troubleshooting rules</a></li>
<li><a href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-pipes.html" target="_blank" rel="noopener">EventBridge Pipes</a></li>
<li><a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html" target="_blank" rel="noopener">AWS Systems Manager Automation</a></li>
<li><a href="https://docs.aws.amazon.com/lambda/latest/dg/welcome.html" target="_blank" rel="noopener">AWS Lambda – Developer Guide</a></li>
<li><a href="https://aws.amazon.com/devops-agent/" target="_blank" rel="noopener">AWS DevOps Agent</a></li>
<li><a href="https://kiro.dev/" target="_blank" rel="noopener">Kiro</a></li>
<li><a href="https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html" target="_blank" rel="noopener">Amazon Bedrock – User Guide</a></li>
</ul>` },
        { id: "d1-performance", label: "Performance Optimization", type: "recommended",
          concepts: ["Compute Optimizer", "EBS volume types", "IOPS vs throughput", "Placement groups", "S3 multipart", "Transfer Acceleration", "RDS Performance Insights", "RDS Proxy"], tools: ["Compute Optimizer", "EBS", "S3", "EFS", "FSx", "RDS Performance Insights", "DataSync"],
          description: "Right-size and tune EC2, EBS, S3, shared file storage (EFS/FSx/S3 Files) and RDS using metrics, Compute Optimizer and Performance Insights.",
          content: `<h3 id="ec2-perf">3.1 EC2 and Compute</h3><ul>
<li><strong>Compute Optimizer</strong> gives rightsizing and idle-resource recommendations for EC2, ASG, EBS, Lambda, ECS on Fargate, RDS/Aurora, NAT gateways, DynamoDB, ElastiCache and more, from 14 days of CloudWatch metrics (paid enhanced infrastructure metrics extend this to 93 days); EC2 memory-based recommendations need the CloudWatch agent or an external metrics source. Opt in first</li>
<li>Burstable <code>T</code> instances run on <strong>CPU credits</strong>: exhausted credits throttle to baseline. Fix with <code>unlimited</code> mode or a larger/non-burstable family</li>
<li><strong>Placement groups</strong>: <em>cluster</em> (single AZ, lowest latency/high throughput), <em>spread</em> (max 7 running instances per AZ, isolates hardware failure), <em>partition</em> (max 7 partitions per AZ, separate racks per partition; large distributed systems like Kafka/HDFS)</li>
<li>Enhanced networking (ENA), EBS-optimized instances, and <strong>Nitro</strong> families raise network and storage ceilings; match instance EBS bandwidth to the volume you attach</li>
<li>Use <strong>tags</strong> + Cost Explorer / resource groups to find over-provisioned fleets by team or environment</li>
</ul><h3 id="ebs-perf">3.2 EBS</h3><h4>Volume Types</h4><ul>
<li><strong>gp3</strong>: general purpose, baseline 3,000 IOPS / 125 MiB/s, IOPS and throughput scale independently of size up to 80,000 IOPS / 2,000 MiB/s (1 GiB&ndash;64 TiB). Cheaper than gp2 &mdash; the standard migration target</li>
<li><strong>gp2</strong>: IOPS tied to size (3 IOPS/GiB), max 16,000 IOPS / 250 MiB/s, burst credits for small volumes</li>
<li><strong>io1 / io2 Block Express</strong>: provisioned IOPS for latency-sensitive databases. io1 up to 64,000 IOPS / 1,000 MiB/s; io2 Block Express up to 256,000 IOPS / 4,000 MiB/s with 99.999% durability. Both support Multi-Attach (same AZ, Nitro)</li>
<li><strong>st1</strong> (throughput-optimised HDD, big sequential workloads) and <strong>sc1</strong> (cold HDD, cheapest). HDD volumes cannot be boot volumes</li>
</ul><ul>
<li>Monitor <code>VolumeQueueLength</code>, <code>VolumeReadOps/WriteOps</code>, <code>BurstBalance</code> (gp2/st1/sc1), <code>VolumeIdleTime</code></li>
<li><strong>Elastic Volumes</strong> change type, size and IOPS online; you must still extend the file system after growing</li>
<li>Restoring from a snapshot is lazy-loaded: first-read latency is high; use <strong>Fast Snapshot Restore</strong> or pre-warm (read all blocks) for predictable performance</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Needs more than 80,000 IOPS or 2,000 MiB/s, sub-millisecond latency, or 99.999% durability &rarr; <strong>io2 Block Express</strong>. Multi-Attach also requires io1/io2. Need cheaper with same baseline &rarr; migrate <strong>gp2 to gp3</strong>.</p>
</div>
</div><h3 id="s3-perf">3.3 S3 Performance and Cost</h3><ul>
<li>Request rates scale per prefix (3,500 write / 5,500 read per second per prefix); spread keys across prefixes for higher parallelism</li>
<li><strong>Multipart upload</strong> for objects &gt;100 MB (required &gt;5 GB); parallel parts and byte-range fetches speed up large transfers. Abort incomplete uploads with a lifecycle rule</li>
<li><strong>Transfer Acceleration</strong>: uses CloudFront edge network for long-distance uploads to one bucket (bucket-name must be DNS-compliant, no dots)</li>
<li><strong>Lifecycle policies</strong> move objects between classes (Standard &rarr; Standard-IA &rarr; Glacier tiers) or expire them; <strong>Intelligent-Tiering</strong> auto-moves with unknown access patterns. Objects under 128 KB do not transition by default, and early moves out of IA/Glacier classes incur minimum-storage-duration charges (Glacier Flexible Retrieval 90 days, Deep Archive 180 days); Glacier Flexible Retrieval can only go on to Deep Archive</li>
<li><strong>AWS DataSync</strong> automates bulk transfer between on-premises NFS/SMB/HDFS and S3/EFS/FSx, with scheduling, verification and bandwidth throttling</li>
<li><strong>S3 Storage Lens</strong> and <strong>S3 Inventory</strong> expose usage and access patterns for optimisation</li>
</ul><h3 id="shared-storage">3.4 Shared Storage: EFS, FSx, S3 Files</h3><ul>
<li><strong>EFS</strong>: managed NFS for Linux, multi-AZ. Performance modes: <em>General Purpose</em> (default, lowest latency, recommended for all file systems) vs <em>Max I/O</em> (previous generation; not available with Elastic throughput or One Zone); throughput: <em>Elastic</em> (default recommendation), <em>Provisioned</em>, <em>Bursting</em>. <strong>Lifecycle management</strong> moves cold files to IA/Archive; <strong>EFS Replication</strong> for DR</li>
<li><strong>FSx for Windows File Server</strong>: SMB, Active Directory, DFS. <strong>FSx for Lustre</strong>: HPC/ML, S3 integration. <strong>FSx for NetApp ONTAP</strong>: multi-protocol (NFS/SMB/iSCSI). <strong>FSx for OpenZFS</strong>: NFS, low latency</li>
<li><strong>Amazon S3 Files</strong>: a shared file system built on EFS that exposes an S3 bucket (or prefix) as files over NFS 4.1/4.2. Mount it through a <em>mount target</em> (one per AZ) on EC2, ECS, EKS or Lambda. Only the active working set (small files, default &lt;128 KiB) is copied to high-performance storage; large reads (&ge;1 MiB) stream straight from S3. Changes sync automatically in both directions and S3 stays the authoritative copy. Supports file locking, POSIX permissions and KMS encryption; no SMB</li>
<li><strong>Storage Gateway</strong> (File/Volume/Tape) bridges on-premises apps to S3/EBS snapshots</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Windows + SMB + AD = <strong>FSx for Windows</strong>. Linux shared NFS across AZs = <strong>EFS</strong>. HPC with S3 backing = <strong>FSx for Lustre</strong>.</p>
</div>
</div><h3 id="rds-perf">3.5 RDS and Aurora Performance</h3><ul>
<li><strong>CloudWatch Database Insights</strong> (expands RDS Performance Insights): DB load (average active sessions) broken down by wait, SQL, host, user. Spot top SQL and waits; proactive recommendations flag likely issues</li>
<li><strong>Enhanced Monitoring</strong> gives OS-level metrics at up to 1 s granularity; CloudWatch gives hypervisor-level metrics</li>
<li>Key metrics: <code>CPUUtilization</code>, <code>FreeableMemory</code>, <code>DatabaseConnections</code>, <code>ReadIOPS/WriteIOPS</code>, <code>ReplicaLag</code>, <code>FreeStorageSpace</code></li>
<li><strong>RDS Proxy</strong>: pools and shares connections, which stops Lambda and spiky clients exhausting <code>max_connections</code>, and speeds failover</li>
<li>Scale up (instance class), scale out (read replicas), enable <strong>storage autoscaling</strong>, move to gp3/io2 storage, and use <strong>ElastiCache</strong>/DAX to offload reads</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>'Too many connections' from Lambda or autoscaled web tier &rarr; <strong>RDS Proxy</strong>. 'Which query is slow?' &rarr; <strong>Database Insights / Performance Insights</strong>.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>Restored EBS volume needs full performance immediately: enable <strong>Fast Snapshot Restore in the target AZ</strong> (it is enabled per snapshot per AZ), then create the volume there</li>
<li>Low CloudFront cache hit ratio: enable <strong>Origin Shield</strong> near the origin and <strong>raise TTLs</strong>. Origin failover groups add availability, not cache efficiency</li>
<li>Resizing an instance: only if the root device is <strong>EBS</strong> (instance-store root = migrate); you must <strong>stop</strong> it first; the instance ID stays the same; an ASG may mark a stopped instance unhealthy</li>
<li><strong>Enhanced networking</strong> (SR-IOV, ENA/VF) = higher PPS (about 20K+), more bandwidth, lower latency and CPU use; it is not a path to 2,500 Gbps</li>
<li>Slow website with static assets: <strong>CloudFront in front of S3</strong> plus an <strong>Auto Scaling group</strong> for the web tier. A bigger Multi-AZ RDS instance does not fix web-tier load</li>
<li><strong>On-Demand Capacity Reservations</strong> reserve capacity in one AZ for any duration with no billing discount and no 1-/3-year commitment; pair with Savings Plans or Regional RIs for discounts</li>
<li>EBS attach error: the <strong>device name is already in use</strong>; retry with another name</li>
<li>After growing an EBS volume, <strong>extend the partition and file system</strong> inside the OS</li>
<li>About 5 PB to Glacier cheaply: <strong>Snowball Edge Storage Optimized</strong> (about 80 TB usable each) into S3, then a <strong>lifecycle policy</strong> to Glacier</li>
<li>Few hot items drive most reads on RDS: put an <strong>ElastiCache</strong> cache in front; read replicas help less because the same hot rows are still read from the database</li>
<li>ElastiCache Redis with many <code>Evictions</code> (memory full): move to a <strong>larger node type</strong> (more memory). It is the least change for the app</li>
<li>T2/T3 instances throttled after the CPU credits run out: enable <strong>T2/T3 Unlimited</strong> (extra cost) or move to a fixed-performance type; also disable ELB stickiness if load is uneven. Pre-warming the ELB and changing the LB type do not help CPU</li>
<li>Tens of TB per day, 5 PB history, no bandwidth: <strong>Snowball Edge</strong> (Storage Optimized for bulk transfer, Compute Optimized to clean/process data on the device) then analyse in Athena/Redshift</li>
<li>Nightly ETL on the production RDS database: give the ETL team an <strong>RDS Read Replica</strong>, so production is not hit</li>
<li>Gigabytes a day to S3 from distant clients: enable <strong>S3 Transfer Acceleration</strong> and upload to the acceleration endpoint</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html" target="_blank" rel="noopener">AWS Compute Optimizer – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html" target="_blank" rel="noopener">Placement groups – Amazon EC2</a></li>
<li><a href="https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html" target="_blank" rel="noopener">Amazon EBS volume types</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html" target="_blank" rel="noopener">Amazon S3 – Performance guidelines</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html" target="_blank" rel="noopener">Amazon S3 – Lifecycle management</a></li>
<li><a href="https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html" target="_blank" rel="noopener">AWS DataSync – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html" target="_blank" rel="noopener">Amazon EFS – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/fsx/" target="_blank" rel="noopener">Amazon FSx</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-files.html" target="_blank" rel="noopener">Amazon S3 Files</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html" target="_blank" rel="noopener">RDS – Database Insights</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html" target="_blank" rel="noopener">Amazon RDS Proxy</a></li>
</ul>` },
      ]},
      { id: "reliability-continuity", title: "02 · Reliability and Business Continuity (22%)", color: "var(--c-teal)", items: [
        { id: "d2-scalability", label: "Scalability and Elasticity", type: "recommended",
          concepts: ["Auto Scaling policies", "Target tracking", "Scheduled scaling", "Warm pools", "ElastiCache", "CloudFront", "DynamoDB capacity", "Aurora Serverless v2"], tools: ["EC2 Auto Scaling", "CloudFront", "ElastiCache", "DynamoDB", "Aurora"],
          description: "EC2 Auto Scaling and other scaling mechanisms, caching with CloudFront and ElastiCache, and scaling RDS, Aurora and DynamoDB.",
          content: `<h3 id="scaling-compute">1.1 Scaling Compute</h3><ul>
<li><strong>Auto Scaling group (ASG)</strong>: min / desired / max across multiple AZs, built from a <strong>launch template</strong> (launch configurations are legacy)</li>
<li>Policies: <strong>target tracking</strong> (hold a metric like CPU 50% or <code>ALBRequestCountPerTarget</code>), <strong>step</strong>, <strong>simple</strong>, <strong>scheduled</strong>, and <strong>predictive</strong> scaling (forecast from history)</li>
<li><strong>Cooldown / instance warm-up</strong> prevents flapping; <strong>warm pools</strong> keep pre-initialised instances for faster scale-out; <strong>lifecycle hooks</strong> pause launch/terminate for custom actions</li>
<li>Health checks: EC2 (default) vs <strong>ELB</strong> (turn on so unhealthy app targets are replaced). <strong>Instance refresh</strong> rolls out a new AMI/template gradually</li>
<li>Scale on a custom metric or SQS <em>backlog per instance</em> for queue workers; use mixed instances policy with Spot + On-Demand</li>
<li><strong>ECS</strong> Service Auto Scaling + capacity providers; <strong>EKS</strong> Cluster Autoscaler/Karpenter and HPA; <strong>Lambda</strong> reserved and provisioned concurrency; <strong>Application Auto Scaling</strong> covers ECS, DynamoDB, Aurora replicas, Lambda, etc.</li>
</ul><h4>Troubleshooting Scaling</h4><ul>
<li>ASG stuck at desired &lt; expected: hit <code>max</code>, account service quota, no capacity (<code>InsufficientInstanceCapacity</code>), subnet out of IPs, missing key pair/AMI/SG, KMS grant for encrypted AMIs</li>
<li>Instances launch then terminate: failing ELB health check, user data error, or lifecycle hook timing out</li>
<li>Scale-in protection and termination policies decide which instances are removed</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Steady metric target &rarr; <strong>target tracking</strong>. Known traffic spike (Black Friday, 9 am login) &rarr; <strong>scheduled</strong>. Slow-booting fleet &rarr; <strong>warm pool</strong>.</p>
</div>
</div><h3 id="caching">1.2 Caching to Scale</h3><ul>
<li><strong>CloudFront</strong>: cache static and dynamic content at the edge; cache key = path + selected headers/cookies/query strings. Fewer cache-key values &rarr; higher hit ratio. Use TTLs, <strong>invalidations</strong> or versioned file names</li>
<li><strong>ElastiCache</strong>: <em>Redis/Valkey</em> (persistence, replication, Multi-AZ, pub/sub, data structures, backups) vs <em>Memcached</em> (simple, multi-threaded, no persistence/replication)</li>
<li>Caching patterns: <strong>lazy loading</strong> (cache-aside; stale data risk) vs <strong>write-through</strong> (always fresh, cache churn); add TTLs</li>
<li><strong>DAX</strong>: in-memory, API-compatible cache for DynamoDB reads (microsecond latency). Not useful for strongly consistent reads or write-heavy tables</li>
<li><strong>Origin Shield</strong> adds a centralised cache layer to cut origin load; <strong>API Gateway</strong> also has a stage cache</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Read-heavy relational workload &rarr; ElastiCache in front of RDS. Read-heavy DynamoDB &rarr; <strong>DAX</strong>. Global static assets &rarr; <strong>CloudFront</strong>.</p>
</div>
</div><h3 id="scaling-db">1.3 Scaling Databases</h3><ul>
<li><strong>RDS</strong>: vertical scaling (change instance class, brief outage unless Multi-AZ), <strong>read replicas</strong> (async; RDS for MySQL allows up to 15 per source and Aurora up to 15 Aurora Replicas with typically &lt;100 ms lag; RDS does <em>not</em> autoscale read replicas, only Aurora does through Application Auto Scaling), <strong>storage autoscaling</strong></li>
<li><strong>Aurora</strong>: shared distributed storage grows automatically (up to 256 TiB on current engine versions, 128 TiB on older ones); up to 15 low-lag replicas with auto scaling; <strong>Aurora Serverless v2</strong> scales ACUs in fine increments; <strong>Global Database</strong> for cross-Region reads and fast DR</li>
<li><strong>DynamoDB</strong>: <em>on-demand</em> (unpredictable traffic) vs <em>provisioned</em> with Application Auto Scaling; throttling = <code>ProvisionedThroughputExceededException</code>. Fix hot partitions with better keys; <strong>global tables</strong> for multi-Region active-active</li>
<li>RDS read replicas are not a failover target for Multi-AZ (standard) &mdash; they serve read scaling and can be manually promoted</li>
</ul><h4>Exam Scenarios</h4><ul>
<li><code>DisableApiTermination</code> (termination protection) blocks API/console/CLI termination only: an <strong>ASG can still terminate</strong> the instance</li>
<li>Predictable daily/weekly peak: <strong>scheduled scaling</strong> actions scale out before the spike and in after it. Reactive policies lag behind demand</li>
<li>If every instance has <strong>scale-in protection</strong>, a scale-in lowers desired capacity but terminates nothing</li>
<li>ASG at 90% CPU for hours but no scale out: the group is <strong>already at maximum capacity</strong>, the <strong>Launch process is suspended</strong>, or AWS lacks capacity for the instance type. A suspended AZRebalance process is not a cause</li>
<li>Unhealthy ASG instance: it is <strong>replaced almost immediately</strong>; it never recovers by itself (the grace period only delays the first check)</li>
<li>Memory-heavy app in an ASG: RAM is not published by the ELB; scale on a load balancer metric such as <strong>connection count / request count</strong> (or push RAM as a custom metric)</li>
<li>Aurora behind an elastic ASG: use the <strong>Aurora reader endpoint</strong>, which load-balances over replicas as they come and go; no cron to update connection strings</li>
<li>ASG <strong>Terminate</strong> suspended and <strong>AZRebalance</strong> active: rebalance launches new instances, the group can grow up to 10% over its size, and the extra instances are <strong>not</strong> terminated</li>
<li>Daily compute job that can be interrupted: <strong>Spot Instances</strong> for the lowest cost</li>
<li>Session affinity on an ALB (default routes each request independently): enable <strong>stickiness</strong> on the target group</li>
<li>Scale an ASG on SQS backlog: the only SQS CloudWatch dimension is <strong><code>QueueName</code></strong> (use <code>ApproximateNumberOfMessagesVisible</code>)</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html" target="_blank" rel="noopener">Amazon EC2 Auto Scaling – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html" target="_blank" rel="noopener">EC2 Auto Scaling – Scaling policies</a></li>
<li><a href="https://docs.aws.amazon.com/autoscaling/application/userguide/what-is-application-auto-scaling.html" target="_blank" rel="noopener">Application Auto Scaling</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html" target="_blank" rel="noopener">Amazon CloudFront – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html" target="_blank" rel="noopener">Amazon ElastiCache</a></li>
<li><a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html" target="_blank" rel="noopener">Amazon DynamoDB Accelerator (DAX)</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html" target="_blank" rel="noopener">Amazon Aurora – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html" target="_blank" rel="noopener">DynamoDB – Read/write capacity mode</a></li>
</ul>` },
        { id: "d2-ha", label: "Highly Available and Resilient Environments", type: "recommended",
          concepts: ["ELB types", "Health checks", "Cross-zone load balancing", "Route 53 failover", "Multi-AZ", "Fault tolerance", "Application Recovery Controller"], tools: ["Elastic Load Balancing", "Route 53", "Application Recovery Controller", "RDS Multi-AZ"],
          description: "ELB and Route 53 health checks, Multi-AZ designs, and Application Recovery Controller for fault-tolerant architectures.",
          content: `<h3 id="elb">2.1 Elastic Load Balancing</h3><ul>
<li><strong>ALB</strong> (L7: HTTP/HTTPS/gRPC; path/host/header routing; WebSocket; targets: instances, IPs, Lambda). <strong>NLB</strong> (L4: TCP/UDP/TLS; static/Elastic IP per AZ; ultra-low latency; preserves client IP). <strong>GWLB</strong> (L3: inline third-party appliances). CLB is legacy</li>
<li><strong>Health checks</strong>: protocol, path, port, interval, thresholds, success codes. Failed targets receive no traffic; ASG with ELB health checks will replace them</li>
<li><strong>Cross-zone load balancing</strong>: on by default for ALB (free), off by default for NLB/GWLB (inter-AZ data charges when enabled)</li>
<li><strong>Connection draining / deregistration delay</strong> lets in-flight requests finish; <strong>sticky sessions</strong> use cookies (ALB) and can unbalance load; <strong>slow start</strong> ramps traffic to new targets</li>
<li>Access logs (S3), request tracing header <code>X-Amzn-Trace-Id</code>, and <code>X-Forwarded-For</code> to recover the client IP behind ALB</li>
</ul><h4>Common Health-Check Failures</h4><ul>
<li>Security group on targets does not allow the load balancer's security group on the health-check port</li>
<li>App returns non-200 on the health path, wrong path/port, or the app is still booting (raise the grace period)</li>
<li>NACL blocks ephemeral return ports; target in a subnet with no route</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Need a <strong>static IP</strong> or TCP/UDP at millions of requests/s &rarr; <strong>NLB</strong>. Need content-based routing, redirects or WAF &rarr; <strong>ALB</strong>. ALB 502 = target closed the connection or sent a malformed response (or a Lambda target errored); 503 = no registered targets; 504 = connection or idle timeout to the target (check NACL ephemeral ports); 460 = client closed the connection before the idle timeout.</p>
</div>
</div><h3 id="route53">2.2 Route 53 Health Checks and Failover</h3><ul>
<li>Health check types: endpoint (HTTP/HTTPS/TCP), <strong>calculated</strong> (combine other checks), and <strong>CloudWatch alarm</strong> based (needed for private resources, since checkers are on the internet)</li>
<li><strong>Failover routing</strong>: primary + secondary record sets; secondary is used when the primary health check fails (active-passive). Multi-value answer returns up to 8 healthy records</li>
<li>Alias records to ALB/CloudFront/S3 can use <strong>Evaluate Target Health</strong> instead of a separate check</li>
<li>Allow Route 53 health-checker IP ranges through firewalls and security groups</li>
<li>Lower TTL ahead of a planned cutover so DNS changes propagate faster</li>
</ul><h3 id="multi-az">2.3 Fault-Tolerant Designs</h3><ul>
<li>Spread ASG/ELB across at least 2 AZs; keep stateless tiers behind the load balancer and store state in managed services (RDS, DynamoDB, ElastiCache, EFS, S3)</li>
<li><strong>RDS Multi-AZ instance</strong>: synchronous standby, automatic failover (typically a minute or two), same endpoint; not readable. <strong>Multi-AZ DB cluster</strong> (2 readable standbys) and <strong>Aurora</strong> fail over faster</li>
<li>A (zonal) NAT gateway lives in one AZ: deploy one per AZ with per-AZ route tables, or use a <strong>regional NAT gateway</strong> that spreads across AZs for you. EFS and S3 are multi-AZ by design; EBS is single-AZ</li>
<li><strong>Amazon Application Recovery Controller (ARC)</strong>: routing controls and readiness checks to shift traffic safely between AZs/Regions, plus <strong>zonal shift</strong>/autoshift to move traffic away from an impaired AZ</li>
<li>Test with <strong>AWS Fault Injection Service</strong> and rehearse failover (FIS experiments use targets plus CloudWatch-alarm stop conditions); resilience you never tested is a hypothesis</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Forced RDS failover test = <strong>reboot with failover</strong>. Standby cannot serve reads in a classic Multi-AZ instance deployment; use read replicas for that.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>If <strong>all targets in a target group are unhealthy</strong>, the load balancer routes to them anyway (fail-open); with at least one healthy target it uses only healthy ones</li>
<li>Aurora AZ outage with all instances in one AZ: nothing to promote, so you must <strong>manually create new DB instances in another AZ</strong>. With readers in other AZs Aurora promotes one automatically</li>
<li>Users get logged out behind an ALB: enable <strong>sticky sessions</strong> (AWSALB cookie) or move session state to ElastiCache/DynamoDB</li>
<li>Easy RDS high availability: <strong>Multi-AZ</strong> (synchronous standby, automatic failover)</li>
<li>RDS needs automatic failover with no committed-data loss: <strong>Multi-AZ</strong> (synchronous standby). A cross-Region read replica is asynchronous and needs manual promotion</li>
<li>ElastiCache Redis with the lowest RTO: a <strong>replication group</strong> with replicas in several AZs and <strong>Multi-AZ automatic failover</strong>. Memcached has no replication, AOF/RDB snapshots do not fail over, and an ALB cannot front Redis</li>
<li>Load balancer for millions of requests per second at low latency: <strong>Network Load Balancer</strong> (layer 4). ALB is layer 7 (HTTP)</li>
<li>ALB building blocks: at least one <strong>listener</strong>; target groups are attached to listener rules; the default rule has actions but no conditions; one target can be in several target groups; targets can span AZs</li>
<li>Internet-facing load balancer unreachable: it sits in a private subnet, or a <strong>security group / NACL</strong> blocks the listener ports. Not a Lambda target or a 200 code</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" target="_blank" rel="noopener">Elastic Load Balancing – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html" target="_blank" rel="noopener">ALB – Troubleshoot your Application Load Balancers</a></li>
<li><a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html" target="_blank" rel="noopener">Route 53 – Health checks and DNS failover</a></li>
<li><a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html" target="_blank" rel="noopener">Route 53 – Choosing a routing policy</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html" target="_blank" rel="noopener">RDS – Multi-AZ deployments</a></li>
<li><a href="https://docs.aws.amazon.com/r53recovery/latest/dg/what-is-route-53-recovery.html" target="_blank" rel="noopener">Amazon Application Recovery Controller</a></li>
<li><a href="https://aws.amazon.com/fis/" target="_blank" rel="noopener">AWS Fault Injection Service</a></li>
</ul>` },
        { id: "d2-backup-dr", label: "Backup, Restore and Disaster Recovery", type: "recommended",
          concepts: ["AWS Backup", "Backup plans", "Point-in-time restore", "RTO and RPO", "S3 versioning", "Pilot light", "Warm standby", "Cross-Region backup"], tools: ["AWS Backup", "RDS", "S3", "DynamoDB", "EBS snapshots"],
          description: "AWS Backup, database restore methods against RTO/RPO, versioning, and the four DR strategies.",
          content: `<h3 id="backup">3.1 Automating Backups</h3><ul>
<li><strong>AWS Backup</strong>: central, policy-based backup for EC2/EBS, RDS/Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway, and more. A <strong>backup plan</strong> defines schedule, window, lifecycle (transition to cold storage, retention) and copy rules; resources are assigned by <strong>tags</strong> or ARNs</li>
<li><strong>Vaults</strong> store recovery points (KMS-encrypted). <strong>Vault Lock</strong> (WORM) blocks deletion for compliance; <strong>cross-Region</strong> and <strong>cross-account</strong> copy protect against Region loss or compromised account; roll out org-wide via AWS Organizations backup policies</li>
<li><strong>EBS snapshots</strong> are incremental, stored in S3; automate with <strong>Amazon Data Lifecycle Manager</strong> (manages only snapshots/AMIs it created; cross-Region/account copy supported). <strong>Recycle Bin</strong> recovers deleted snapshots/AMIs. Archive tier cuts cost for rarely used snapshots</li>
<li><strong>RDS automated backups</strong>: daily snapshot + transaction logs, retention 0&ndash;35 days, enables point-in-time restore; manual snapshots persist until deleted. Deleting an instance removes automated backups unless you retain them</li>
<li><strong>DynamoDB</strong>: on-demand backups and <strong>PITR</strong> (35-day window, per-second restore). Restore always creates a <em>new</em> table</li>
<li><strong>Backup Audit Manager</strong> reports on compliance of backups against policy</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Compliance requires backups nobody (even root) can delete &rarr; <strong>AWS Backup Vault Lock</strong>. Survive account compromise &rarr; copy to a vault in a <strong>separate account</strong>.</p>
</div>
</div><h3 id="restore">3.2 Restoring Databases to Meet RTO / RPO / Cost</h3><ul>
<li><strong>RPO</strong> = acceptable data loss (time); <strong>RTO</strong> = acceptable downtime. Tighter targets cost more</li>
<li><strong>Point-in-time restore</strong> (RDS, Aurora, DynamoDB) always creates a new instance/table with a new endpoint; update the application or DNS afterwards</li>
<li><strong>Aurora Backtrack</strong> rewinds a cluster in place without restoring (MySQL-compatible); <strong>Aurora cloning</strong> creates fast copy-on-write clones for testing</li>
<li><strong>Cross-Region read replica</strong> can be promoted for DR (minutes RTO, seconds RPO); snapshot copy to another Region is cheaper but slower (hours RTO)</li>
<li>Encrypted snapshots shared across accounts need the KMS key shared too; to change encryption copy the snapshot with a new key</li>
</ul><h3 id="versioning">3.3 Versioning</h3><ul>
<li><strong>S3 Versioning</strong>: every overwrite creates a new version; delete adds a <em>delete marker</em> (remove it to restore). Once enabled it can only be <em>suspended</em>, not disabled</li>
<li>Pair with <strong>lifecycle rules</strong> for noncurrent versions, <strong>MFA Delete</strong> for protection, and <strong>Object Lock</strong> (needs versioning) for WORM retention</li>
<li><strong>S3 Replication</strong> (CRR/SRR) requires versioning on both buckets; it does not replicate existing objects unless you use Batch Replication</li>
<li><strong>FSx</strong> offers shadow copies (Windows) and snapshots/backups; EFS relies on AWS Backup</li>
</ul><h3 id="dr">3.4 Disaster Recovery Strategies</h3><table><thead><tr><th>Strategy</th><th>RTO / RPO</th><th>Idea</th></tr></thead><tbody><tr><td><strong>Backup &amp; restore</strong></td><td>Hours</td><td>Cheapest. Copy backups cross-Region; rebuild infrastructure from IaC after a disaster</td></tr><tr><td><strong>Pilot light</strong></td><td>Tens of minutes</td><td>Core data layer replicated and always running; compute switched off, started on demand</td></tr><tr><td><strong>Warm standby</strong></td><td>Minutes</td><td>Scaled-down but fully functional copy always running; scale up on failover</td></tr><tr><td><strong>Multi-site active/active</strong></td><td>Near zero</td><td>Full capacity in 2+ Regions serving traffic; highest cost and complexity</td></tr></tbody></table><ul>
<li>Use Route 53 failover/latency routing, Aurora Global Database, DynamoDB global tables, S3 CRR, and CloudFormation/AWS Backup to implement the strategy</li>
<li><strong>AWS Elastic Disaster Recovery (DRS)</strong> continuously replicates servers to a low-cost staging area for pilot-light style recovery</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Match the words: 'lowest cost, hours acceptable' = backup &amp; restore; 'minimal always-on core' = pilot light; 'scaled-down running copy' = warm standby; 'zero downtime' = active/active.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>A deleted/deregistered AMI cannot be restored. Rebuild it from the <strong>retained EBS snapshots</strong> or by creating a new AMI from the <strong>running instance</strong></li>
<li>Keep for 5 years then delete: <strong>Object Lock retention (retain until date)</strong> to block early deletion plus a <strong>lifecycle expiration</strong> after 5 years; lifecycle alone does not prevent deletion</li>
<li>Recover from accidental S3 deletes: <strong>bucket versioning</strong> (add MFA Delete for protection)</li>
<li>Application-consistent AMI: create it with <strong>No reboot disabled</strong> (default) so the instance is shut down; No reboot gives crash-consistent images</li>
<li>On-premises backup software needing block/POSIX storage: <strong>Storage Gateway stored volume</strong> (iSCSI), async EBS snapshots to AWS</li>
<li>Replace an on-premises NFS v3 share with S3 and keep hot files cached locally: <strong>S3 File Gateway</strong> (NFS/SMB to S3 objects with a local cache). Volume Gateway is block (iSCSI), not file</li>
<li>Weekly 1 TB archives kept 7 years and not deletable/changeable (WORM): <strong>S3 Glacier with a Vault Lock policy</strong></li>
<li>On-premises iSCSI block devices backed by AWS: <strong>Volume Gateway</strong> (File Gateway is NFS/SMB)</li>
<li>Deleted all objects but the bucket will not delete: <strong>versioning</strong> is on and <strong>delete markers / old versions</strong> remain; remove them (or use a lifecycle rule) first</li>
<li>Central backup across accounts with cross-Region copy: <strong>AWS Backup</strong> plans (tag-based, Organizations backup policies; for example one for production, one for non-production). DLM only covers EBS snapshots, and Maintenance Windows or EventBridge are not backup managers</li>
<li>Notify when S3 replication fails or lags: <strong>S3 Replication Time Control (RTC)</strong> (15 minute target, with metrics and events). A daily list of objects with failed replication: <strong>S3 Inventory</strong> (replication status). Storage Lens and S3 Select do not do this</li>
<li>S3 Object Lock: retention is per object version. An explicit request sets a <strong>Retain Until Date</strong> and overrides the bucket default; the bucket default is a duration in days or years</li>
<li>Intermittent S3 <code>500 Internal Error</code>: <strong>retry with exponential backoff</strong> and watch the S3 request metric for 5xx in CloudWatch. 403s are the permission errors</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html" target="_blank" rel="noopener">AWS Backup – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/aws-backup/latest/devguide/vault-lock.html" target="_blank" rel="noopener">AWS Backup – Vault Lock</a></li>
<li><a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/snapshot-lifecycle.html" target="_blank" rel="noopener">Amazon Data Lifecycle Manager</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html" target="_blank" rel="noopener">RDS – Restoring a DB instance to a specified time</a></li>
<li><a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html" target="_blank" rel="noopener">DynamoDB – Point-in-time recovery</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html" target="_blank" rel="noopener">Amazon S3 – Using versioning</a></li>
<li><a href="https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html" target="_blank" rel="noopener">Disaster recovery of workloads on AWS (whitepaper)</a></li>
<li><a href="https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html" target="_blank" rel="noopener">AWS Elastic Disaster Recovery</a></li>
</ul>` },
      ]},
      { id: "deployment-automation", title: "03 · Deployment, Provisioning and Automation (22%)", color: "var(--c-orange)", items: [
        { id: "d3-provisioning", label: "Provision and Maintain Cloud Resources", type: "recommended",
          concepts: ["EC2 Image Builder", "CloudFormation", "Change sets", "Drift detection", "StackSets", "AWS CDK", "AWS RAM", "Blue/green deployment"], tools: ["EC2 Image Builder", "CloudFormation", "AWS CDK", "StackSets", "AWS RAM", "Terraform", "Git"],
          description: "AMIs and Image Builder, CloudFormation and CDK, deployment troubleshooting, StackSets and RAM, deployment strategies, and Terraform/Git.",
          content: `<h3 id="ami">1.1 AMIs and Container Images</h3><ul>
<li><strong>EC2 Image Builder</strong>: pipeline = recipe (base image + build/test components) + infrastructure config + distribution settings (Regions, accounts). Runs on a schedule and can test and distribute hardened golden AMIs and container images to ECR</li>
<li>AMIs are Regional: <strong>copy</strong> them to use in another Region; share with accounts via launch permissions (plus snapshot/KMS key access if encrypted)</li>
<li>Deprecate or deregister old AMIs; <strong>Recycle Bin</strong> and AMI lifecycle policies manage clean-up</li>
<li><strong>ECR</strong>: private/public registries, image scanning (basic/enhanced with Inspector), lifecycle policies to expire untagged images, replication across Regions/accounts</li>
</ul><h3 id="cfn">1.2 CloudFormation and CDK</h3><ul>
<li>Template sections: <code>Parameters</code>, <code>Mappings</code>, <code>Conditions</code>, <code>Resources</code> (only required one), <code>Outputs</code>. Intrinsic functions: <code>Ref</code>, <code>Fn::GetAtt</code>, <code>Fn::Sub</code>, <code>Fn::ImportValue</code></li>
<li><strong>Change sets</strong> preview an update; <strong>drift detection</strong> finds out-of-band changes; <strong>stack policies</strong> and <strong>termination protection</strong> guard critical stacks; <code>DeletionPolicy: Retain/Snapshot</code> keeps data on stack delete; <code>UpdateReplacePolicy</code> for replacements</li>
<li><strong>Nested stacks</strong> reuse templates; <strong>cross-stack references</strong> use exports; <strong>helper scripts</strong> (<code>cfn-init</code>, <code>cfn-signal</code>) with <code>CreationPolicy</code> and <code>WaitCondition</code> make CloudFormation wait for instance bootstrap</li>
<li><strong>AWS CDK</strong>: define infrastructure in TypeScript/Python/Java/etc.; <code>cdk synth</code> produces CloudFormation, <code>cdk diff</code> previews, <code>cdk deploy</code> deploys; needs a one-time <code>cdk bootstrap</code> per account/Region. L1 = raw resources, L2 = curated constructs, L3 = patterns</li>
</ul><h4>Stack Failure States</h4><ul>
<li><code>CREATE_FAILED</code> &rarr; a failed first create rolls back to <code>ROLLBACK_COMPLETE</code>, which cannot be updated &mdash; delete the (empty) stack and create it again, or use a new name. To debug instead, pick <em>Preserve successfully provisioned resources</em> (disable rollback) so the stack stays in <code>CREATE_FAILED</code> and you can retry or update. <code>UPDATE_ROLLBACK_COMPLETE</code> is different: the stack can be updated again</li>
<li><code>UPDATE_ROLLBACK_FAILED</code> &rarr; fix the cause (or skip the resource) then <strong>Continue update rollback</strong></li>
<li><code>DELETE_FAILED</code> typically a non-empty S3 bucket, a security group or ENI still in use, missing delete permissions, or stack termination protection; retry the delete with <code>RetainResources</code> (or <code>FORCE_DELETE_STACK</code>) to skip the stuck resource</li>
<li>Read the <strong>Events</strong> tab: first failed event holds the root cause (quota, invalid parameter, missing IAM permission, name already exists)</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>CloudFormation fails creating instances waiting for a signal &rarr; check <code>cfn-signal</code>, the <code>CreationPolicy</code> timeout, and network access for the instance to reach the CloudFormation endpoint.</p>
</div>
</div><h3 id="deploy-issues">1.3 Identify and Remediate Deployment Issues</h3><ul>
<li><strong>Subnet sizing</strong>: AWS reserves 5 IPs per subnet; a too-small CIDR runs out of IPs for ASG, Lambda ENIs, EKS pods and ENIs. Add subnets or secondary CIDRs</li>
<li><strong>Quotas</strong> (vCPU, EIPs, VPCs): request an increase in Service Quotas; <code>InsufficientInstanceCapacity</code>: retry later, try another AZ/instance type</li>
<li><strong>Permissions</strong>: caller or CloudFormation service role lacks <code>iam:PassRole</code> or resource actions; check CloudTrail for <code>AccessDenied</code></li>
<li>Resource name collisions, circular dependencies, and wrong parameter types are frequent template errors; validate with <code>cfn-lint</code> / <code>aws cloudformation validate-template</code></li>
</ul><h3 id="multi-account">1.4 Multi-Region and Multi-Account Provisioning</h3><ul>
<li><strong>CloudFormation StackSets</strong>: deploy one template to many accounts/Regions; <em>service-managed</em> permissions integrate with Organizations (auto-deploy to new accounts), <em>self-managed</em> needs IAM administrator and execution roles you create in the administrator and target accounts (works for any account you can create a role in). Service-managed runs from the Organizations management account or a delegated administrator. A StackSet is a Regional resource; control rollout with <em>maximum concurrent accounts</em>, <em>failure tolerance</em> (per Region) and sequential vs parallel Region order, and use <em>retain stacks</em> to delete instances without deleting the stacks</li>
<li><strong>AWS RAM</strong> shares resources (subnets, Transit Gateway, Route 53 Resolver rules, License Manager configs) without copying them; enable sharing with Organizations</li>
<li><strong>Control Tower</strong> sets up a landing zone with guardrails; <strong>Service Catalog</strong> offers pre-approved products to teams; both build on Organizations</li>
</ul><h3 id="strategies">1.5 Deployment Strategies and Third-Party Tools</h3><ul>
<li><strong>In-place / rolling</strong>: update instances in batches (some capacity loss). <strong>Blue/green</strong>: new environment alongside old, switch traffic (Route 53 weighted, ALB target groups), fast rollback. <strong>Canary / linear</strong>: shift a percentage gradually (CodeDeploy, Lambda aliases). <strong>Immutable</strong>: replace instances entirely</li>
<li><strong>CodeDeploy</strong> supports EC2/on-prem, Lambda, and ECS with hooks and automatic rollback on alarms; <strong>Elastic Beanstalk</strong> offers all-at-once, rolling, rolling with additional batch, immutable and traffic splitting</li>
<li><strong>Terraform</strong> (state, plan/apply, remote backend in S3 with locking) and <strong>Git</strong> (branches, pull requests, tags) drive reviewed, repeatable infrastructure changes; keep secrets out of repositories</li>
</ul><h4>Exam Scenarios</h4><ul>
<li>Same CloudFormation template in several Regions behaves oddly: <strong>custom-named IAM resources</strong> are global per account, so stacks collide/share them. Avoid fixed IAM names (or use CAPABILITY_NAMED_IAM carefully)</li>
<li>Bring existing resources under CloudFormation: <strong>resource import</strong> (change set of type IMPORT). Drift detection only reports differences</li>
<li>Executing one change set <strong>deletes the other change sets</strong> of that stack; create a new one from the updated stack</li>
<li>Protect critical resources from accidental update/delete: <strong>stack policy</strong> (and termination protection / DeletionPolicy)</li>
<li>Read a resource attribute such as the DB endpoint or DNS name: <code>!GetAtt</code> (<code>Ref</code> returns the id/name only)</li>
<li>Roll IAM roles out to many accounts: <strong>CloudFormation StackSets</strong> with AWS Organizations</li>
<li>Debug a failed <code>cfn-init</code> on an instance CloudFormation would delete: create the stack with <strong><code>OnFailure=DO_NOTHING</code></strong> (or <code>--disable-rollback</code>; the two cannot be combined) and read <code>/var/log/cfn-init.log</code>. Do not change the instance</li>
<li>Stack shows <code>CREATE_COMPLETE</code> while <code>cfn-init</code> still runs: add a <strong>CreationPolicy (or WaitCondition)</strong> so CloudFormation waits for <code>cfn-signal</code> before continuing</li>
<li><code>InsufficientInstanceCapacity</code>: AWS has no capacity right now, so <strong>retry later or try another AZ / instance type</strong>. <code>InstanceLimitExceeded</code> is the quota error (request a limit increase)</li>
<li>AMI shared from account A to B, then deregistered in A: <strong>no new instances</strong> can be launched in A or B; instances already running in B are not affected. Copy the AMI <em>before</em> deregistering it</li>
<li>Keep EBS data when a stack is deleted: <code>DeletionPolicy: Snapshot</code> on the volume</li>
<li>Stack stuck waiting for <code>cfn-signal</code> in a private subnet: the instance needs a <strong>network route to CloudFormation</strong> (NAT Gateway/IGW or a VPC endpoint), and the signal must arrive before the <strong>timeout</strong></li>
<li>A script that checks AMI IDs against an approved list: <strong>AMI IDs are Region-specific</strong>, so keep one approved list per Region</li>
<li>Share a VPC or subnet ID across stacks: <code>Export</code> in <code>Outputs</code> of the first stack and <strong><code>Fn::ImportValue</code></strong> in the second (same account and Region). <code>Ref</code> cannot import, and <code>Fn::Transform</code> is for macros</li>
<li>Conditions can be attached to <strong>Resources and Outputs</strong>, not to Parameters</li>
<li>Stack deletion returns with no error and the stack is unchanged: <strong>termination protection</strong> is on (also via the root stack for nested stacks). Missing permissions or non-empty resources give <code>DELETE_FAILED</code></li>
<li>A stack policy only guards stack updates (Principal is always <code>*</code>) and grants no access: users still need <strong>IAM</strong> permissions</li>
<li>Resize an instance-store-backed instance: create an image, launch the new type from it, and move the <strong>Elastic IP</strong> (a public IP is released). Terminate the old instance afterwards</li>
<li>Own software with socket/core level licensing: <strong>Dedicated Host</strong>. Single-tenant hardware at the lowest cost: <strong>Dedicated Instance</strong>. Spot Instances cannot have termination protection</li>
<li>Spot interruption behaviors: <strong>stop, hibernate, terminate</strong> (default). Reboot does not exist</li>
<li>EBS vs instance store: instance store data is lost on stop, hibernate or terminate; a non-root EBS volume keeps its data by default (<code>DeleteOnTermination</code> is false); keep OS and data on separate volumes; boot volumes can be encrypted; snapshots are reached via the EC2 API, not the S3 API, and only hold data already written to the volume</li>
<li><strong>io1</strong> allows at most <strong>50 IOPS per GiB</strong> (100 GiB gives 5,000, so 7,500 is invalid); st1 and sc1 cannot be boot volumes</li>
<li>Test a new RDS engine version on production data first: snapshot the DB, restore it to a new instance, and upgrade that copy. A read replica or a CloudFormation copy is not the same data and state</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html" target="_blank" rel="noopener">EC2 Image Builder – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html" target="_blank" rel="noopener">Amazon ECR – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" target="_blank" rel="noopener">AWS CloudFormation – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html" target="_blank" rel="noopener">CloudFormation – Troubleshooting</a></li>
<li><a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html" target="_blank" rel="noopener">CloudFormation StackSets</a></li>
<li><a href="https://docs.aws.amazon.com/cdk/v2/guide/home.html" target="_blank" rel="noopener">AWS CDK – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/ram/latest/userguide/what-is.html" target="_blank" rel="noopener">AWS Resource Access Manager</a></li>
<li><a href="https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html" target="_blank" rel="noopener">AWS CodeDeploy – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html" target="_blank" rel="noopener">AWS Control Tower</a></li>
<li><a href="https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html" target="_blank" rel="noopener">AWS Service Catalog</a></li>
</ul>` },
        { id: "d3-automation", label: "Automate Management of Existing Resources", type: "recommended",
          concepts: ["Systems Manager", "Patch Manager", "State Manager", "Maintenance Windows", "Parameter Store", "Session Manager", "Lambda triggers", "S3 Event Notifications"], tools: ["Systems Manager", "Lambda", "EventBridge", "S3 Event Notifications", "Step Functions"],
          description: "Systems Manager capabilities for patching and fleet operations, plus event-driven automation with Lambda, S3 events and EventBridge.",
          content: `<h3 id="ssm">2.1 Systems Manager Operational Capabilities</h3><ul>
<li><strong>Prerequisites</strong>: SSM Agent installed, instance profile with <code>AmazonSSMManagedInstanceCore</code>, outbound HTTPS to SSM endpoints (or interface VPC endpoints <code>ssm</code>, <code>ssmmessages</code> and <code>ec2messages</code>, plus an S3 gateway endpoint for agent updates; optional <code>kms</code>, <code>logs</code>, <code>ec2</code> for VSS snapshots). Endpoint security groups must allow 443 from the instances</li>
<li><strong>Fleet Manager / inventory</strong>: view and collect software and config data; <strong>Hybrid activations</strong> add on-premises servers</li>
<li><strong>Run Command</strong>: ad-hoc commands across tags/resource groups with rate control. <strong>State Manager</strong>: enforce desired state on a schedule (associations). <strong>Maintenance Windows</strong>: schedule disruptive tasks</li>
<li><strong>Patch Manager</strong>: patch baselines (approval rules, auto-approval delay), patch groups via tag <code>Patch Group</code> (or <code>PatchGroup</code>, required if instance tags are exposed in IMDS; one group and one baseline per OS per node; not used with newer patch policies), scan vs scan-and-install, compliance reporting; run in Maintenance Windows</li>
<li><strong>Session Manager</strong>: browser/CLI shell with no inbound ports, no bastion or SSH keys, IAM-controlled, logged to S3/CloudWatch Logs</li>
<li><strong>Parameter Store</strong> (plain/SecureString config, free standard tier) and <strong>Secrets Manager</strong> (rotation) for configuration; <strong>OpsCenter</strong> and <strong>Incident Manager</strong> track and respond to issues; <strong>Change Manager</strong> adds approvals</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Patch a fleet on a schedule with approvals and reports &rarr; <strong>Patch Manager + Maintenance Window</strong>. Keep a setting enforced continuously &rarr; <strong>State Manager</strong>. SSH-less access &rarr; <strong>Session Manager</strong>.</p>
</div>
</div><h3 id="event-driven">2.2 Event-Driven Automation</h3><ul>
<li><strong>Lambda</strong> triggers: S3, SNS, SQS, DynamoDB Streams, Kinesis, EventBridge, API Gateway. Sync vs async invocation: async invocation retries a function error twice by default (waits of 1 then 2 minutes), while throttles (429) and 5xx system errors are retried for up to 6 hours; after that Lambda discards the event unless you set a <strong>DLQ or on-failure destination</strong>; events can arrive more than once, so make handlers idempotent; stream/queue triggers retry until data expires unless bisect/on-failure destinations are set</li>
<li><strong>S3 Event Notifications</strong> send object events (created, removed, restore, replication) to Lambda, SNS, SQS, or EventBridge (richer filtering and more targets). Resource policy on the target must allow S3</li>
<li>Typical patterns: tag non-compliant resources, snapshot before change, stop idle dev instances on a schedule, quarantine an instance flagged by GuardDuty, remediate Config non-compliance via SSM Automation</li>
<li><strong>Step Functions</strong> coordinates multi-step workflows with retries, branching and human approval (callback pattern). <em>Standard</em> workflows run up to 1 year, exactly-once; <em>Express</em> up to 5 minutes, at-least-once (async) for high-volume idempotent work; <strong>SQS</strong> decouples producers and consumers to absorb bursts</li>
<li>Lambda ops notes: set reserved/provisioned concurrency, timeouts and memory to fit workload; errors surface in CloudWatch Logs, <code>Errors</code>/<code>Throttles</code> metrics and X-Ray</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Object lands in S3 and needs processing &rarr; <strong>S3 event &rarr; Lambda</strong> (or SQS to buffer). Need fan-out to many consumers &rarr; <strong>SNS or EventBridge</strong>.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>Auto Scaling <code>Client.InternalError: Client error on launch</code> with an encrypted EBS volume: the <strong>service-linked role has no access to the customer managed KMS key</strong>; across accounts, use a KMS key in the <strong>same account as the ASG</strong>, re-encrypt (copy) the snapshot with it, and allow the service-linked role on that key</li>
<li>Patch many EC2 instances in one go: <strong>Systems Manager Patch Manager</strong> (also for urgent Windows security patches); patching the OS is the customer's job under shared responsibility</li>
<li>Collect software/metadata from EC2 and on-premises servers: <strong>Systems Manager Inventory</strong></li>
<li>A Lambda that stops instances at night but must skip some: <strong>tag</strong> those instances and have the function skip the tag</li>
<li>Cost per department / find idle Elastic IP spend: activate <strong>cost allocation tags</strong> and report in <strong>Cost Explorer</strong></li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html" target="_blank" rel="noopener">AWS Systems Manager – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/patch-manager.html" target="_blank" rel="noopener">Systems Manager Patch Manager</a></li>
<li><a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html" target="_blank" rel="noopener">Systems Manager Session Manager</a></li>
<li><a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html" target="_blank" rel="noopener">Systems Manager Parameter Store</a></li>
<li><a href="https://docs.aws.amazon.com/systems-manager/latest/userguide/state-manager.html" target="_blank" rel="noopener">Systems Manager State Manager</a></li>
<li><a href="https://docs.aws.amazon.com/lambda/latest/dg/lambda-invocation.html" target="_blank" rel="noopener">AWS Lambda – Invoking functions</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html" target="_blank" rel="noopener">Amazon S3 – Event notifications</a></li>
<li><a href="https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html" target="_blank" rel="noopener">AWS Step Functions</a></li>
<li><a href="https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html" target="_blank" rel="noopener">Amazon SQS – Developer Guide</a></li>
</ul>` },
      ]},
      { id: "security-compliance", title: "04 · Security and Compliance (16%)", color: "var(--c-pink)", items: [
        { id: "d4-iam-governance", label: "Security and Compliance Tools and Policies", type: "recommended",
          concepts: ["IAM policies", "Roles and STS", "Permission boundaries", "SCPs", "IAM Identity Center", "Access Analyzer", "Policy simulator", "AWS Config"], tools: ["IAM", "IAM Access Analyzer", "Organizations", "IAM Identity Center", "Trusted Advisor", "AWS Config"],
          description: "IAM features, access troubleshooting, multi-account governance with Organizations and SCPs, Trusted Advisor, and continuous compliance with AWS Config.",
          content: `<h3 id="iam">1.1 IAM Features</h3><ul>
<li><strong>Principals</strong>: users, groups, roles (temporary credentials via STS; preferred for workloads). Never use root for day-to-day work; enable MFA and lock away root keys</li>
<li><strong>Policy types</strong>: identity-based, resource-based (S3 bucket, KMS key, SQS, Lambda), permission boundaries, session policies, SCPs. Evaluation: <em>explicit deny</em> always wins &rarr; otherwise need an explicit allow (and an SCP/boundary allow where applicable)</li>
<li>Same-account access: identity <em>or</em> resource policy allow is enough. Cross-account: <em>both</em> sides must allow (except when the resource policy names the principal for some services)</li>
<li><strong>Conditions</strong>: <code>aws:MultiFactorAuthPresent</code>, <code>aws:SourceIp</code>, <code>aws:RequestedRegion</code>, <code>aws:PrincipalOrgID</code>, <code>aws:SourceVpce</code>, tag-based <code>aws:ResourceTag</code>/<code>aws:PrincipalTag</code> (ABAC)</li>
<li><strong>Federation</strong>: SAML 2.0 / OIDC with <code>AssumeRoleWithSAML</code>/<code>AssumeRoleWithWebIdentity</code>; IAM Identity Center for workforce SSO; EKS uses IRSA / Pod Identity</li>
<li><strong>Password policy</strong> (length, rotation, reuse), access keys rotation, credential report (<code>aws iam generate-credential-report</code>) and access advisor (last used)</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>A role assumed by EC2 &rarr; <strong>instance profile</strong>. 'Access denied even though the user policy allows' &rarr; look for an explicit deny, SCP, permission boundary, or missing resource-policy/KMS key permission.</p>
</div>
</div><h3 id="audit-access">1.2 Troubleshoot and Audit Access</h3><ul>
<li><strong>CloudTrail</strong>: find the denied API call, the principal, and the error (<code>errorCode: AccessDenied</code>, with the decoded message from <code>sts decode-authorization-message</code>)</li>
<li><strong>IAM policy simulator</strong>: test what a principal can do against actions/resources; <strong>Access Analyzer</strong> finds resources shared externally (analyzer is per Region), internal access to chosen resources, unused access, and validates/generates least-privilege policies from CloudTrail activity</li>
<li><strong>Credential report</strong> and <strong>access advisor</strong> highlight stale users, keys and permissions to trim</li>
<li>S3 'Access Denied': check bucket policy, Block Public Access, ACLs/ownership, VPC endpoint policy, KMS key policy for SSE-KMS objects</li>
</ul><h3 id="multi-account">1.3 Multi-Account Strategy</h3><ul>
<li><strong>AWS Organizations</strong>: OUs, consolidated billing, central policies. <strong>Service control policies (SCPs)</strong> set the maximum permissions for member accounts &mdash; they never grant access; they apply to member accounts (including their root users) but not to the management account or service-linked roles</li>
<li>Typical SCPs: deny leaving the organization, deny disabling CloudTrail/Config/GuardDuty, restrict Regions with <code>aws:RequestedRegion</code>, require encryption/tags</li>
<li><strong>IAM Identity Center</strong>: central SSO for AWS accounts and apps, permission sets per account, integrates with an external IdP or Active Directory</li>
<li><strong>Control Tower</strong> automates a multi-account landing zone with preventive (SCP), detective (Config) and proactive (CloudFormation hooks) controls (formerly called guardrails)</li>
<li>Delegated administrator accounts for security services (GuardDuty, Security Hub, Config, Backup) keep the management account clean</li>
</ul><h3 id="trusted-config">1.4 Trusted Advisor and Compliance Monitoring</h3><ul>
<li><strong>Trusted Advisor</strong> checks cost, performance, security, fault tolerance, service limits, and operational excellence. Full set of checks needs Business Support+, Enterprise Support or Unified Operations (Basic Support: service limits plus selected security and fault-tolerance checks; Developer and Business plans are being discontinued 1 Jan 2027); security checks flag open security groups, public S3 buckets, missing MFA on root, exposed access keys. Automate via EventBridge</li>
<li><strong>AWS Config</strong>: records configuration history and evaluates it against <strong>rules</strong> (managed or custom Lambda/Guard); <strong>conformance packs</strong> are YAML templates bundling managed/custom rules and remediation actions, deployed as one unit to an account and Region or across an organization (from the management or delegated administrator account), with sample templates for frameworks; <strong>aggregators</strong> give multi-account/Region views; <strong>remediation actions</strong> run SSM Automation documents</li>
<li>Config is evaluation of <em>state</em> (detective); SCPs and IAM conditions are <em>preventive</em>. Region and service selections are enforced with SCPs and checked with Config</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>'Continuously check that resources comply, and auto-fix' &rarr; <strong>Config rule + SSM Automation remediation</strong>. 'Block it from ever happening in member accounts' &rarr; <strong>SCP</strong>.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>One user reading S3 buckets in two other accounts and copying data back: <strong>identity-based policy in the user's account</strong> + <strong>resource-based bucket policies</strong> in the HR/Audit accounts (no role switch, so no loss of the user's own permissions)</li>
<li>Developers (not testers) into production: <strong>role in the production account trusting the dev account</strong>, then IAM group policies in dev: allow developers to assume it, deny testers</li>
<li>Root user denied on a bucket: a bucket policy without the root principal can lock it out. The root user can still <strong>edit or delete the bucket policy</strong>; no Support case needed</li>
<li>Shared responsibility for abstracted services (S3): AWS runs the <strong>OS, platform and infrastructure</strong>; you choose encryption options, IAM and data classification</li>
<li>Report that no known vulnerabilities remain on EC2 after patching: <strong>Amazon Inspector</strong> (findings/assessment report). Patch Manager patches, it does not report CVEs</li>
<li>Find your most active IAM users: <strong>CloudTrail</strong> events queried with <strong>Athena</strong></li>
<li>Many accounts with different rules: <strong>AWS Organizations with OUs</strong> and SCPs, not IAM groups/roles in each account</li>
<li>Federating an external IdP with <strong>IAM Identity Center</strong>: give the IdP the SAML metadata from Identity Center (Identity Center is the SAML service provider)</li>
<li>Mobile users upload to S3: <strong>federate with Cognito</strong> so they assume an IAM role; do not embed keys</li>
<li>Find security groups open on a forbidden port (e.g. 846): <strong>AWS Config</strong> rule for compliance</li>
<li>The only resource-based policy type IAM supports is the <strong>role trust policy</strong>. ACLs, SCPs and permissions boundaries are different policy types</li>
<li>IAM best practices: <strong>MFA</strong> for privileged users, <strong>CloudTrail</strong> for IAM actions, least privilege, no shared credentials, and <strong>roles</strong> (not user keys) for EC2</li>
<li>EC2 app that needs SQS send/receive/delete: an <strong>instance role</strong> limited to those three actions on the specific queues. Not <code>sqs:*</code>, IAM user keys in config files, or an IP based queue policy</li>
<li>Shared responsibility: on EC2 the customer patches the guest OS and sets security groups; for S3, AWS runs the OS and platform and the customer manages data and IAM</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html" target="_blank" rel="noopener">AWS IAM – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html" target="_blank" rel="noopener">IAM – Policy evaluation logic</a></li>
<li><a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html" target="_blank" rel="noopener">IAM Access Analyzer</a></li>
<li><a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html" target="_blank" rel="noopener">IAM policy simulator</a></li>
<li><a href="https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html" target="_blank" rel="noopener">AWS Organizations – Service control policies</a></li>
<li><a href="https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html" target="_blank" rel="noopener">AWS IAM Identity Center</a></li>
<li><a href="https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html" target="_blank" rel="noopener">AWS Trusted Advisor</a></li>
<li><a href="https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html" target="_blank" rel="noopener">AWS Config – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html" target="_blank" rel="noopener">AWS Config – Conformance packs</a></li>
</ul>` },
        { id: "d4-data-protection", label: "Protect Data and Infrastructure", type: "recommended",
          concepts: ["Data classification", "KMS keys", "Envelope encryption", "ACM certificates", "Secrets Manager", "Security Hub", "GuardDuty", "Inspector"], tools: ["KMS", "ACM", "Secrets Manager", "Macie", "GuardDuty", "Security Hub", "Inspector"],
          description: "Data classification, KMS encryption at rest, ACM encryption in transit, secrets storage, and security findings from Security Hub, GuardDuty, Inspector and Config.",
          content: `<h3 id="classification">2.1 Data Classification</h3><ul>
<li>Define levels (public, internal, confidential, restricted), then tag resources and map controls to each level (encryption, access, retention)</li>
<li><strong>Amazon Macie</strong> discovers and classifies sensitive data (PII, credentials) in S3 and raises findings; use tags and Config rules (<code>required-tags</code>) to enforce classification labels</li>
<li>Combine with S3 Block Public Access, bucket policies, Object Lock, and lifecycle rules to implement the policy</li>
</ul><h3 id="kms">2.2 Encryption at Rest (KMS)</h3><ul>
<li><strong>Key types</strong>: AWS owned keys, AWS managed keys (<code>aws/s3</code>, rotated yearly automatically, cannot edit policy), <strong>customer managed keys (CMKs)</strong> (you control policy and grants; optional automatic rotation every 365 days by default with a configurable rotation period, plus on-demand rotation; both only for symmetric keys with KMS-generated or imported material), imported key material, and external key store</li>
<li>Access = <strong>key policy</strong> (required; root account enabling IAM policies) + IAM policy/<strong>grants</strong>. Cross-account use needs both the key policy and the other account's IAM policy</li>
<li><strong>Envelope encryption</strong>: KMS generates a data key; the data key encrypts data and is stored encrypted next to it. KMS API request limit leads to throttling &rarr; use <strong>S3 Bucket Keys</strong> or cache data keys</li>
<li>S3 options: SSE-S3, SSE-KMS, SSE-C, DSSE-KMS; default encryption on all new objects. EBS, RDS, EFS, DynamoDB, Redshift encrypt at creation &mdash; to encrypt an existing unencrypted EBS/RDS copy the snapshot with a KMS key and restore</li>
<li><strong>Multi-Region keys</strong> let you encrypt in one Region and decrypt in another; disabling or deleting a key (7&ndash;30 day wait) makes data unrecoverable</li>
</ul><h4>Troubleshooting KMS</h4><ul>
<li><code>AccessDeniedException</code>/<code>KMSKeyNotAccessibleFault</code>: principal missing <code>kms:Decrypt</code>/<code>GenerateDataKey</code>, key disabled or pending deletion</li>
<li>EC2 cannot launch from encrypted AMI/EBS in another account: share the CMK and grant <code>CreateGrant</code> to the Auto Scaling service-linked role</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Need full control, audit, rotation schedule or cross-account sharing &rarr; <strong>customer managed key</strong>. AWS managed keys cannot be shared across accounts.</p>
</div>
</div><h3 id="acm">2.3 Encryption in Transit (ACM)</h3><ul>
<li><strong>AWS Certificate Manager (ACM)</strong> provisions, manages and auto-renews public TLS certificates (DNS validation preferred; email validation as alternative) for ELB, CloudFront, API Gateway. Standard public ACM certs cannot be exported (they only attach to integrated services like ELB, CloudFront, API Gateway). To use a cert on EC2, containers or on-premises, request an <strong>exportable public certificate</strong> (extra charge, DNS validation, 198-day validity, renewed 45 days before expiry), or use <strong>ACM Private CA</strong> or import your own</li>
<li><strong>CloudFront requires certificates in us-east-1</strong>; ELB/API Gateway regional endpoints need the cert in the same Region</li>
<li>Renewal fails if the DNS validation CNAME was removed; imported certificates are <em>not</em> auto-renewed (exportable certs do renew, but you must redeploy them) (use EventBridge <code>ACM Certificate Approaching Expiration</code>)</li>
<li>Enforce HTTPS: ALB HTTP&rarr;HTTPS redirect, CloudFront viewer protocol policy, S3 bucket policy denying <code>aws:SecureTransport = false</code>, RDS <code>require_ssl</code> parameter, minimum TLS versions in security policies</li>
</ul><h3 id="secrets">2.4 Secrets</h3><ul>
<li><strong>Secrets Manager</strong>: stores secrets with KMS encryption, <strong>automatic rotation</strong> (Lambda; built-in templates for RDS/Aurora, Redshift, DocumentDB), cross-Region replication, resource policies</li>
<li><strong>SSM Parameter Store</strong> <code>SecureString</code>: cheap config + secrets, no native rotation, standard parameters free</li>
<li>Never hard-code credentials in code, AMIs, user data or environment variables in plain text; reference secrets from ECS/Lambda/CloudFormation dynamic references <code>{{resolve:secretsmanager:...}}</code></li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>'Rotate database credentials automatically' &rarr; <strong>Secrets Manager</strong>. 'Simple, low-cost configuration values' &rarr; <strong>Parameter Store</strong>.</p>
</div>
</div><h3 id="findings">2.5 Findings and Reports</h3><ul>
<li><strong>GuardDuty</strong>: threat detection using CloudTrail, VPC Flow Logs, DNS logs by default, plus optional protection plans (S3, EKS audit logs, RDS login activity, Lambda network activity, Runtime Monitoring, Malware Protection) and Extended Threat Detection for multi-stage attacks; findings are not preventive &mdash; route to EventBridge for automated response (isolate instance, revoke keys)</li>
<li><strong>Inspector</strong>: continual vulnerability and network-exposure scanning for EC2 instances, ECR images and Lambda functions, re-scanning automatically when packages or new CVEs change; <strong>Macie</strong>: sensitive data in S3</li>
<li><strong>Security Hub</strong> (the posture-management service is documented as <em>Security Hub CSPM</em>): aggregates and prioritises findings from GuardDuty, Inspector, Macie, Config, IAM Access Analyzer, and checks against standards (AWS Foundational Security Best Practices, CIS, PCI DSS). Most controls need AWS Config recording enabled; it only sees findings generated after you enable it, in the Region where it is enabled. Use a delegated admin and cross-Region aggregation, plus automation rules or EventBridge for response</li>
<li><strong>AWS Security Agent</strong> (in scope for SOA-C03; AWS now brands it <em>Continuum for penetration testing</em>): an AI agent that tests applications and source code from design docs, user stories and IaC context, builds threat models, and reports validated vulnerabilities with reproducible proof and fix guidance</li>
<li><strong>AWS Config</strong> non-compliance + <strong>Trusted Advisor</strong> security checks + <strong>AWS Artifact</strong> compliance reports complete the picture</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Compromised EC2 detected by GuardDuty &rarr; EventBridge &rarr; Lambda/SSM to isolate (swap to a deny-all security group, snapshot for forensics) rather than terminate immediately.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>S3 <strong>website endpoint</strong> as CloudFront origin: must be a <strong>custom origin</strong>, so OAI/OAC are not possible; restrict access with a secret <strong>custom header</strong> that the origin checks</li>
<li>Sharing an AMI: you do <strong>not</strong> need to share its snapshots; encrypted AMIs must use a <strong>customer managed KMS key</strong> (not the AWS managed key) and you must share that key too</li>
<li>Storage Gateway encrypts in transit with <strong>SSL/TLS</strong> and at rest by default with <strong>SSE-S3</strong> (KMS keys optional via the API), so the data is already protected</li>
<li>Force TLS to RDS PostgreSQL: set <strong><code>rds.force_ssl=1</code></strong> in the DB <strong>parameter group</strong> (default 0)</li>
<li>Enable S3 <strong>MFA Delete</strong> with the <strong>root account and the AWS CLI</strong> (not console, not IAM users). It needs MFA to change versioning state and permanently delete a version</li>
<li>Spot employees reading S3 objects they cannot access: enable <strong>S3 server access logs</strong> and query with <strong>Athena</strong></li>
<li>Force encryption on every upload: bucket <strong>Default Encryption</strong></li>
<li>Share a daily report with 10,000+ changing customers: <strong>pre-signed URLs</strong></li>
<li>With MFA Delete, MFA is required to <strong>permanently delete an object version</strong> and to <strong>suspend (change) versioning</strong>; uploading versions, listing and enabling versioning need none</li>
<li>KMS key deleted a day ago: it is <strong>pending deletion</strong> (7 to 30 days, default 30), so <strong>cancel the deletion</strong>. After the window it is gone; neither root nor AWS Support can restore it</li>
<li>Share a KMS key with another account: the <strong>key policy</strong> must allow the external account and an <strong>IAM policy in that account</strong> must delegate to its users/roles. AWS owned keys and service-linked roles cannot be shared this way</li>
<li>S3 encryption choices: <strong>SSE-KMS</strong> when AWS manages the keys but you need an audit trail of who used them (CloudTrail); <strong>SSE-C</strong> when you supply the key on every request (for example kept on premises); SSE-S3 has no key audit; client-side means you encrypt first</li>
<li>Header for SSE-KMS uploads: <code>x-amz-server-side-encryption: aws:kms</code> (<code>AES256</code> means SSE-S3)</li>
<li>Recreate a Secrets Manager secret with the same name during its recovery window: delete it with the CLI <code>--force-delete-without-recovery</code> (<code>ForceDeleteWithoutRecovery</code>); the console keeps the window</li>
<li>Encrypted secret strings with decryption auditing and one simple API call: <strong>SSM Parameter Store <code>SecureString</code></strong> and <strong>CloudTrail</strong>. Encrypting with KMS first needs two calls, and there is no SSM Audit Trail</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/kms/latest/developerguide/overview.html" target="_blank" rel="noopener">AWS KMS – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html" target="_blank" rel="noopener">KMS – Key policies</a></li>
<li><a href="https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html" target="_blank" rel="noopener">AWS Certificate Manager – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/acm/latest/userguide/acm-exportable-certificates.html" target="_blank" rel="noopener">ACM – Exportable public certificates</a></li>
<li><a href="https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html" target="_blank" rel="noopener">AWS Secrets Manager – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html" target="_blank" rel="noopener">Amazon Macie – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html" target="_blank" rel="noopener">Amazon GuardDuty – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html" target="_blank" rel="noopener">Amazon Inspector – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html" target="_blank" rel="noopener">AWS Security Hub CSPM – User Guide</a></li>
<li><a href="https://aws.amazon.com/security-agent/" target="_blank" rel="noopener">AWS Security Agent (Continuum for penetration testing)</a></li>
</ul>` },
      ]},
      { id: "networking-delivery", title: "05 · Networking and Content Delivery (18%)", color: "var(--c-lime)", items: [
        { id: "d5-vpc", label: "Networking Features and Connectivity", type: "recommended",
          concepts: ["VPC", "Route tables", "Security groups vs NACLs", "NAT gateway", "VPC endpoints", "PrivateLink", "VPC peering", "Transit Gateway"], tools: ["VPC", "NAT gateway", "VPC endpoints", "PrivateLink", "Transit Gateway", "WAF", "Network Firewall"],
          description: "VPC design (subnets, routes, NACLs, security groups, NAT/IGW), private connectivity with endpoints/PrivateLink/peering, network protection services and cost optimisation.",
          content: `<h3 id="vpc">1.1 Configure a VPC</h3><ul>
<li><strong>Public subnet</strong> = route table has <code>0.0.0.0/0 &rarr; internet gateway</code> and instances have public/Elastic IPs. <strong>Private subnet</strong> = no IGW route; outbound internet via <strong>NAT gateway</strong> placed in a public subnet (one per AZ for resilience)</li>
<li><strong>Egress-only internet gateway</strong>: outbound-only IPv6 (NAT equivalent for IPv6). VPC CIDR /16 to /28; AWS reserves 5 IPs per subnet; add secondary CIDRs when you run out</li>
<li><strong>Security groups</strong>: stateful, allow rules only, evaluated as a whole, attached to ENIs, can reference other security groups. <strong>Network ACLs</strong>: stateless, allow and deny, numbered rules evaluated in order, per subnet; need ephemeral ports (1024&ndash;65535) for return traffic</li>
<li>DHCP options, DNS resolution (<code>enableDnsSupport</code>, <code>enableDnsHostnames</code>), <strong>IPAM</strong> for planning and tracking IP space across accounts and Regions</li>
<li>NAT gateway vs <strong>NAT instance</strong>: gateway is managed, scales automatically, no security group; instance needs source/dest check disabled and is self-managed. NAT gateway types: <em>public</em> (needs an Elastic IP) or <em>private</em> (to other VPCs/on-premises); availability modes: <em>zonal</em> (single AZ in a public subnet) or <em>regional</em> (one NAT ID that expands across AZs automatically, no public subnet needed, no private NAT)</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Block one specific bad IP &rarr; <strong>NACL deny</strong> (security groups cannot deny). Instance can reach the internet outbound only &rarr; private subnet + NAT gateway.</p>
</div>
</div><h3 id="private">1.2 Private Connectivity</h3><ul>
<li><strong>Gateway endpoints</strong> (S3 and DynamoDB): free, route-table entry via prefix list, endpoint policy. <strong>Interface endpoints</strong> (<strong>PrivateLink</strong>): ENI with private IP in your subnet for most other services or your own NLB-fronted service; hourly + data cost; enable private DNS</li>
<li><strong>VPC peering</strong>: one-to-one, non-transitive, no overlapping CIDRs, needs routes on both sides (cross-Region and cross-account supported)</li>
<li><strong>Transit Gateway</strong>: hub-and-spoke for many VPCs and on-premises (attachments, route tables, peering between TGWs, RAM sharing). <strong>Site-to-Site VPN</strong> (IPsec, two tunnels per connection, up to 1.25 Gbps per tunnel; Large Bandwidth Tunnels reach 5 Gbps on Transit Gateway/Cloud WAN attachments), <strong>Direct Connect</strong> (dedicated private link), <strong>Client VPN</strong> (remote users)</li>
<li>S3 traffic from private subnets through a gateway endpoint avoids NAT data processing charges</li>
</ul><h3 id="protection">1.3 Network Protection Services (Audit)</h3><ul>
<li><strong>AWS WAF</strong>: L7 web ACLs on CloudFront, ALB, API Gateway REST APIs, AppSync, Cognito user pools, App Runner, Verified Access (managed rule groups, rate-based rules, geo, IP sets, bot control)</li>
<li><strong>AWS Shield</strong>: Standard (free, automatic network- and transport-layer L3/4 DDoS protection, strongest for Route 53, CloudFront and Global Accelerator); Advanced (paid; response team, cost protection, enhanced detection)</li>
<li><strong>AWS Network Firewall</strong>: stateful and stateless inspection, domain filtering, Suricata rules at VPC level. <strong>Route 53 Resolver DNS Firewall</strong>: block DNS lookups to malicious domains. <strong>Firewall Manager</strong> centralises policy across accounts</li>
<li>Audit with logs: WAF logs (Firehose/S3/CloudWatch Logs), Network Firewall logs, Resolver query logs, and Config rules that check association of protections</li>
</ul><h3 id="cost">1.4 Optimise Network Cost</h3><ul>
<li>Data between AZs and between Regions costs money; traffic in via the internet is free, out via the internet is charged</li>
<li>Use gateway endpoints for S3/DynamoDB; consolidate NAT gateways thoughtfully (cost vs AZ resilience); use CloudFront to cut origin egress</li>
<li>Prefer private IPs within a VPC; use VPC endpoints instead of NAT for AWS service traffic; right-size Transit Gateway attachments and data processing</li>
<li>Release unused <strong>Elastic IPs</strong> (idle public IPv4 addresses are charged); review IPv4 usage and consider IPv6</li>
</ul><h4>Exam Scenarios</h4><ul>
<li>VPC facts: a subnet's IPv4 range is always private, a VPC needs a CIDR block, subnets route to each other by default; a <strong>subnet lives in exactly one AZ</strong> (VPCs span AZs)</li>
<li>Instances that need internet access in a public subnet: <strong>internet gateway</strong> + route; an egress-only IGW is IPv6 only</li>
<li>Public-IP traffic between EC2 instances stays on the AWS network within a Region, and across Regions only with <strong>inter-Region VPC peering</strong>; otherwise it is not guaranteed</li>
<li>IPv6 outbound-only from private subnets: <strong>egress-only internet gateway</strong> (IPv4 uses a NAT gateway)</li>
<li>Reach Systems Manager APIs without the internet: <strong>interface VPC endpoint</strong> (PrivateLink)</li>
<li>Public and private subnets in one VPC reach each other with <strong>no extra configuration</strong> (local route); you only control it with SGs/NACLs</li>
<li>Software-only private link from the data center to a VPC: <strong>Site-to-Site VPN</strong> (over the internet, IPsec). <strong>Direct Connect</strong> is a physical, dedicated link and takes weeks to set up</li>
<li>Subnet size for 28 instances: AWS reserves <strong>5 IPs per subnet</strong>, so usable = 2^(32−x) − 5. A /27 gives 27 (too few), so use <strong>/26</strong> (59)</li>
<li>Subnets in different AZs of the same VPC talk by private IP with no extra setup: the <strong>main route table has an implicit local route</strong> for the VPC CIDR</li>
<li>VPC peering up but no traffic: add the route in <strong>both</strong> VPCs' route tables (plus SG/NACL)</li>
<li>Private subnet needs internet: route <code>0.0.0.0/0</code> to the <strong>NAT Gateway</strong>, which lives in a <strong>public</strong> subnet</li>
<li>A security group rule that references another security group allows <strong>all instances in that group</strong>, not one IP (common reason unexpected 172.x hosts reach a bastion)</li>
<li>Dedicated, encrypted, low-latency, high-throughput link to AWS: <strong>Direct Connect plus VPN</strong>. Direct Connect alone is not encrypted, VPN alone is not low latency, and a transit gateway is only a hub</li>
<li>Private RDS that must reach the internet for patches: instance in a private subnet, <strong>NAT Gateway in a public subnet</strong>, public subnet routes to the IGW. IPv6 needs an egress-only IGW and VPC peering joins VPCs, not subnets</li>
<li>Allow VPC2 into VPC1: allow it in the <strong>security group</strong> inbound rules (stateful). The default NACL already allows all traffic (stateless, rules both directions)</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" target="_blank" rel="noopener">Amazon VPC – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html" target="_blank" rel="noopener">VPC – Compare security groups and network ACLs</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html" target="_blank" rel="noopener">VPC – NAT gateways</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html" target="_blank" rel="noopener">VPC – Gateway endpoints</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html" target="_blank" rel="noopener">AWS PrivateLink</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html" target="_blank" rel="noopener">VPC peering</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html" target="_blank" rel="noopener">AWS Transit Gateway</a></li>
<li><a href="https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html" target="_blank" rel="noopener">AWS WAF – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html" target="_blank" rel="noopener">AWS Network Firewall</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/ipam/what-it-is-ipam.html" target="_blank" rel="noopener">Amazon VPC IP Address Manager</a></li>
</ul>` },
        { id: "d5-dns-cdn", label: "Domains, DNS and Content Delivery", type: "recommended",
          concepts: ["Hosted zones", "Routing policies", "Route 53 Resolver", "Alias records", "Query logging", "CloudFront", "Origin access control", "Global Accelerator"], tools: ["Route 53", "Route 53 Resolver", "CloudFront", "Global Accelerator"],
          description: "Route 53 hosted zones, Resolver and hybrid DNS, routing policies, query logging, CloudFront and Global Accelerator.",
          content: `<h3 id="dns">2.1 Configure DNS</h3><ul>
<li><strong>Public hosted zone</strong> (internet) vs <strong>private hosted zone</strong> (associated VPCs; requires <code>enableDnsSupport</code> and <code>enableDnsHostnames</code>). Delegation uses the zone's NS records at the registrar</li>
<li><strong>Alias</strong> records (free, work at the zone apex, point at AWS resources, health aware) vs <strong>CNAME</strong> (cannot be used at the apex)</li>
<li><strong>Route 53 Resolver</strong>: the VPC DNS at <code>.2</code>. For hybrid DNS use <strong>inbound endpoints</strong> (on-premises &rarr; AWS) and <strong>outbound endpoints</strong> + forwarding rules (AWS &rarr; on-premises); share rules with RAM</li>
<li>Register domains, enable <strong>DNSSEC</strong> signing, and keep domain transfer lock/auto-renew in check</li>
</ul><h3 id="routing">2.2 Routing Policies and Query Logging</h3><table><thead><tr><th>Policy</th><th>Use</th></tr></thead><tbody><tr><td>Simple</td><td>Single resource, no health checks</td></tr><tr><td>Weighted</td><td>Split traffic by percentage (canary, A/B, migration)</td></tr><tr><td>Latency</td><td>Send users to the Region with lowest latency</td></tr><tr><td>Failover</td><td>Active-passive with health check</td></tr><tr><td>Geolocation</td><td>Route by user country/continent (compliance, localisation); include a default record</td></tr><tr><td>Geoproximity</td><td>Route by the location of your resources, shifting traffic between locations with a bias</td></tr><tr><td>IP-based</td><td>Route by client CIDR ranges</td></tr><tr><td>Multivalue answer</td><td>Return several healthy IPs (not a load balancer substitute)</td></tr></tbody></table><ul>
<li><strong>Public DNS query logging</strong> goes to CloudWatch Logs (us-east-1 log group); <strong>Resolver query logging</strong> captures VPC DNS queries to CloudWatch Logs, S3 or Firehose</li>
<li>Failed resolution: check record exists in the right zone, private zone associated with the VPC, TTL caching, and Resolver rule/forwarding path</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Geolocation = <em>where the user is</em>; Latency = <em>fastest Region</em>; Geoproximity = <em>distance with bias</em>. If the scenario says 'must serve EU users only from EU', that is geolocation.</p>
</div>
</div><h3 id="cdn">2.3 Content and Service Distribution</h3><ul>
<li><strong>CloudFront</strong> origins: S3 (use <strong>Origin Access Control</strong> to keep the bucket private; it replaces the legacy OAI and supports SSE-KMS and all Regions; an S3 website endpoint must be a custom origin and cannot use OAC), ALB/EC2, API Gateway, custom HTTP. Behaviors route path patterns to different origins and set cache policy, origin request policy, and function associations</li>
<li><strong>Security</strong>: HTTPS viewer policy, signed URLs/cookies for private content, geo restriction, field-level encryption, <strong>WAF</strong> and Shield integration, custom error pages, origin failover groups</li>
<li><strong>CloudFront Functions</strong> (lightweight viewer request/response) vs <strong>Lambda@Edge</strong> (heavier logic, origin events)</li>
<li><strong>Global Accelerator</strong>: two static anycast IPs that route over the AWS backbone to the nearest healthy endpoint (ALB, NLB, EC2, EIP); great for non-HTTP (TCP/UDP), gaming, IoT, fast regional failover and static IP allow-lists. CloudFront caches content; Global Accelerator does not cache</li>
</ul><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Static IPs needed and fast failover across Regions &rarr; <strong>Global Accelerator</strong>. Cache content close to users &rarr; <strong>CloudFront</strong>.</p>
</div>
</div><h4>Exam Scenarios</h4><ul>
<li>CloudFront 4xx/400 after an S3 origin bucket moved Region (delete and recreate elsewhere): <strong>update the distribution</strong> so it finds the bucket in its current Region</li>
<li>Remove a bad file from CloudFront right away: <strong>invalidate</strong> it (or version file names)</li>
<li>Cut cost of serving a 10 TB monthly file from EFS behind an ALB: store it in <strong>S3</strong> and serve through <strong>CloudFront</strong></li>
<li>CloudFront HTTPS with automatic renewal: request the certificate in <strong>ACM</strong> (in us-east-1 for CloudFront) and use <strong>DNS validation</strong>. Self-signed certificates and Secrets Manager do not renew; there is no rotation switch in CloudFront</li>
<li>CloudFront returns many 5xx (e.g. 501): enable <strong>standard (access) logs</strong> to S3 and query them with <strong>Athena</strong></li>
<li>Serve only to subscribers through CloudFront: <strong>signed URLs</strong> (one file) or <strong>signed cookies</strong> (many files, URLs unchanged). Forcing HTTPS does not restrict access</li>
<li>S3 bucket set as a website endpoint behind CloudFront: viewers can be forced to HTTPS, but CloudFront to the S3 website origin is <strong>HTTP only</strong></li>
<li>Route 53 to serve a country only from local servers: <strong>geolocation</strong> (add a default record or others get no answer). <code>www</code> to a third party host name: <strong>CNAME</strong> (Alias is for AWS targets, and no CNAME at the zone apex)</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html" target="_blank" rel="noopener">Amazon Route 53 – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html" target="_blank" rel="noopener">Route 53 Resolver</a></li>
<li><a href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/query-logs.html" target="_blank" rel="noopener">Route 53 – Public DNS query logging</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html" target="_blank" rel="noopener">Amazon CloudFront – Developer Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html" target="_blank" rel="noopener">CloudFront – Restrict access to an S3 origin (OAC)</a></li>
<li><a href="https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html" target="_blank" rel="noopener">AWS Global Accelerator</a></li>
</ul>` },
        { id: "d5-troubleshoot", label: "Troubleshoot Network Connectivity", type: "recommended",
          concepts: ["Reachability Analyzer", "VPC Flow Logs", "ELB access logs", "Cache hit ratio", "Site-to-Site VPN", "Direct Connect", "Network Synthetic Monitor", "Internet Monitor"], tools: ["VPC Reachability Analyzer", "VPC Flow Logs", "CloudWatch Internet Monitor", "Network Monitor", "CloudFront logs"],
          description: "Systematic VPC troubleshooting, reading flow/ELB/WAF/CloudFront logs, CloudFront caching issues, hybrid connectivity, and CloudWatch network monitoring.",
          content: `<h3 id="vpc-ts">3.1 Troubleshoot VPC Configurations</h3><ul>
<li>Work through the path in order: <strong>source SG outbound</strong> &rarr; <strong>source subnet NACL outbound</strong> &rarr; <strong>route table</strong> (IGW/NAT/TGW/peering/endpoint) &rarr; <strong>destination NACL inbound</strong> &rarr; <strong>destination SG inbound</strong> &rarr; OS firewall / app listening</li>
<li><strong>VPC Reachability Analyzer</strong>: static analysis of a path between two endpoints; tells you which component blocks it (route, SG, NACL). <strong>Network Access Analyzer</strong> finds unintended access paths</li>
<li>Typical causes: missing route to IGW/NAT, NAT in a private subnet, no public IP/EIP, NACL ephemeral-port rule missing (stateless), SG referencing the wrong group, overlapping CIDRs on peering/TGW, missing return route in the peer or TGW route table</li>
<li>Private instance cannot reach SSM/CloudWatch/S3: no NAT or VPC endpoint, or endpoint security group blocks 443, or private DNS disabled</li>
<li>Traceability: ping uses ICMP (may be blocked by design) &mdash; test with <code>curl</code>/<code>nc</code> on the actual port</li>
</ul><h3 id="logs">3.2 Collect and Interpret Network Logs</h3><ul>
<li><strong>VPC Flow Logs</strong> (VPC/subnet/ENI level) &rarr; CloudWatch Logs, S3, or Firehose. Record: <code>srcaddr dstaddr srcport dstport protocol action log-status</code>. <code>ACCEPT</code>/<code>REJECT</code> shows if SG/NACL allowed it. An <code>ACCEPT</code> for the inbound packet but <code>REJECT</code> for the response points to a stateless <strong>NACL</strong></li>
<li><strong>ELB access logs</strong> (S3; ALB logs request time, target status, processing times) and <strong>connection logs</strong>; Logs not real time. Compare <code>elb_status_code</code> vs <code>target_status_code</code></li>
<li><strong>WAF web ACL logs</strong>: which rule matched/blocked; use sampled requests for quick checks. <strong>CloudFront standard logs</strong> (S3) and real-time logs (Kinesis): <code>x-edge-result-type</code> (Hit, Miss, Error, RefreshHit)</li>
<li><strong>Container logs</strong>: <code>awslogs</code>/FireLens for ECS, Container Insights + Fluent Bit for EKS; query with CloudWatch Logs Insights or Athena over S3 logs</li>
</ul><pre><code>fields @timestamp, srcAddr, dstAddr, dstPort, action
| filter action = "REJECT" and dstPort = 443
| stats count(*) as rejects by srcAddr
| sort rejects desc | limit 20</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Use <strong>Athena</strong> for large historic S3 logs (ALB, CloudFront, Flow Logs); use <strong>Logs Insights</strong> for recent logs already in CloudWatch.</p>
</div>
</div><h3 id="cf-ts">3.3 CloudFront Caching Issues</h3><ul>
<li>Low hit ratio: cache key includes too many headers/cookies/query strings, TTLs too short, <code>Cache-Control: no-cache/private</code> from origin, or dynamic content without a cache policy</li>
<li>Stale content: raise/lower TTL, create an <strong>invalidation</strong> (cost beyond free tier) or use versioned object names</li>
<li><strong>4xx/5xx</strong>: 403 from S3 origin &rarr; OAC/bucket policy; 502/504 &rarr; origin unreachable/timeouts/TLS mismatch (certificate name must match origin domain); configure origin timeouts and failover</li>
<li>Check <code>X-Cache</code> response header (<code>Hit from cloudfront</code>, <code>Miss</code>, <code>Error</code>) and the <code>CacheHitRate</code> metric</li>
</ul><h3 id="hybrid-ts">3.4 Hybrid and Private Connectivity</h3><ul>
<li><strong>Site-to-Site VPN</strong>: two tunnels per connection; tunnel down &rarr; check IKE/IPsec parameters, customer gateway device config, NAT-T, BGP/static routes, and <code>TunnelState</code> metric; enable route propagation on route tables</li>
<li><strong>Direct Connect</strong>: virtual interfaces (private, public, transit), BGP session state, LOA-CFA, VLAN/ASN mismatch; use a VPN as backup and BFD for fast failure detection (AWS turns on asynchronous BFD for every virtual interface, but it only works once you configure it on your own router; BGP alone waits ~90 s hold time); Direct Connect gateway for multi-VPC</li>
<li><strong>Transit Gateway</strong>: attachment association/propagation, route table entries, overlapping CIDRs. <strong>Interface endpoint</strong> issues: DNS (private DNS), SG, endpoint policy, or wrong Region</li>
<li>On-premises name resolution failing &rarr; Route 53 Resolver inbound/outbound endpoints and forwarding rules, plus firewalls allowing UDP/TCP 53</li>
</ul><h3 id="cw-network">3.5 CloudWatch Network Monitoring</h3><ul>
<li><strong>CloudWatch Internet Monitor</strong>: user-experience internet health (performance and availability) for your applications by city/ISP</li>
<li><strong>CloudWatch Network Synthetic Monitor</strong>: fully managed, agentless probes from a VPC subnet to on-premises IPs for hybrid-network latency and packet loss; a network health indicator (0 or 100) shows whether degradation is inside AWS</li>
<li><strong>Synthetics canaries</strong> test endpoints/APIs on a schedule; <strong>Network Flow Monitor</strong> shows workload network performance between resources; use alarms on the metrics to notify via SNS</li>
</ul><h4>Exam Scenarios</h4><ul>
<li>RDS MySQL read replica errors: <strong>writes to the replica</strong> break replication; replica <code>max_allowed_packet</code> smaller than the source also causes errors; nontransactional engines (MyISAM) are the usual trouble</li>
<li>App suddenly cannot reach a Multi-AZ RDS DB in a private subnet: check the <strong>DB security group inbound rules</strong> first (a changed rule is the usual cause)</li>
<li>Many 4xx from a load balancer whose targets are terminated at random: enable <strong>ELB access logs</strong> (off by default, stored in S3) and query them with <strong>Athena</strong></li>
<li>VPN host can ping in but replies are lost (Flow Logs show outbound REJECT): the subnet <strong>NACL is stateless</strong>, so allow the <strong>outbound</strong> ICMP too</li>
<li>Client IP shows the load balancer address: read <strong><code>X-Forwarded-For</code></strong> (<code>X-Forwarded-Proto</code> is only HTTP or HTTPS)</li>
<li>Latency and client IP patterns per request: <strong>ELB access logs</strong> (off by default). CloudWatch metrics are aggregates, CloudTrail logs API calls, request tracing only adds a trace header</li>
<li>VPC Flow Logs with an access error: the IAM role lacks permission or the trust relationship to the flow logs service. A flow log cannot be edited, so <strong>delete and recreate</strong> it</li>
<li>403 on a public S3 bucket and the cause is unclear: run the <strong><code>AWSSupport-TroubleshootS3PublicRead</code></strong> automation runbook in Systems Manager</li>
</ul><h3 id="references">References</h3><ul>
<li><a href="https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html" target="_blank" rel="noopener">VPC Reachability Analyzer</a></li>
<li><a href="https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html" target="_blank" rel="noopener">VPC Flow Logs</a></li>
<li><a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html" target="_blank" rel="noopener">ALB – Access logs</a></li>
<li><a href="https://docs.aws.amazon.com/waf/latest/developerguide/logging.html" target="_blank" rel="noopener">AWS WAF – Logging web ACL traffic</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/troubleshooting-response-errors.html" target="_blank" rel="noopener">CloudFront – Troubleshooting</a></li>
<li><a href="https://docs.aws.amazon.com/vpn/latest/s2svpn/Troubleshooting.html" target="_blank" rel="noopener">Site-to-Site VPN – Troubleshooting</a></li>
<li><a href="https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html" target="_blank" rel="noopener">AWS Direct Connect – User Guide</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-InternetMonitor.html" target="_blank" rel="noopener">CloudWatch Internet Monitor</a></li>
<li><a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/what-is-network-monitor.html" target="_blank" rel="noopener">CloudWatch Network Synthetic Monitor</a></li>
</ul>` },
      ]},
    ],
};
