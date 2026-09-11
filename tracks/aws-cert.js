const TRACK_AWS_CERT = {
    id: "aws-cert", code: "AWS-CERT", title: "SAP-C02",
    tagline: "SAP-C02 — Solutions Architect Professional.",
    blurb: "The senior-architect exam, broken into its four official domains — organizational complexity, new solutions, continuous improvement, and migration & modernization.",
    storageKey: "ops4life:aws-cert", accent: "var(--c-orange)",
    sections: [
      { id: "organizational-complexity", title: "01 · Organizational Complexity (26%)", color: "var(--c-orange)", items: [
        { id: "network-connectivity", label: "Architect Network Connectivity Strategies", type: "recommended",
          description: "Global infrastructure and VPC connectivity, hybrid connectivity, hybrid DNS, and network segmentation & traffic monitoring for large multi-account AWS environments.",
          content: `<h3 id="global-infra-vpc-connectivity">1.1 AWS Global Infrastructure and VPC Connectivity Options</h3><h4>Global Infrastructure Building Blocks</h4><ul>
<li><strong>Region</strong>: isolated geographic area with 3+ Availability Zones (AZs)</li>
<li><strong>Availability Zone (AZ)</strong>: one or more discrete data centers with independent power/cooling/networking, low-latency links to other AZs in the Region</li>
<li><strong>Local Zones</strong>: extend a Region closer to end users for latency-sensitive workloads</li>
<li><strong>Wavelength Zones</strong>: embed compute/storage inside telco 5G networks for ultra-low latency</li>
<li><strong>Edge locations</strong>: CloudFront/Global Accelerator POPs, separate from Regions/AZs</li>
</ul><h4>VPC-to-VPC Connectivity Options</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Option</th><th>Use case</th><th>Transitive routing?</th><th>Scale</th></tr>
</thead>
<tbody>
<tr><td><strong>VPC Peering</strong></td><td>Point-to-point, low VPC count</td><td>No</td><td>Manual, doesn't scale past ~dozens</td></tr>
<tr><td><strong>AWS Transit Gateway (TGW)</strong></td><td>Hub-and-spoke, many VPCs/VPNs/DX</td><td>Yes (via TGW route tables)</td><td>Thousands of attachments</td></tr>
<tr><td><strong>PrivateLink (VPC Endpoint Services)</strong></td><td>Expose a single service, not full network reachability</td><td>N/A (service-level, not network-level)</td><td>Very high, no route table entries</td></tr>
<tr><td><strong>AWS Cloud WAN</strong></td><td>Global, managed network-as-code across Regions</td><td>Yes</td><td>Enterprise-scale, policy-driven</td></tr>
</tbody>
</table>
</div><pre><code># Create a Transit Gateway and attach a VPC
aws ec2 create-transit-gateway --description "Org hub TGW" \\
  --options AmazonSideAsn=64512,AutoAcceptSharedAttachments=disable,DefaultRouteTableAssociation=enable

aws ec2 create-transit-gateway-vpc-attachment \\
  --transit-gateway-id tgw-0123456789abcdef0 \\
  --vpc-id vpc-0123456789abcdef0 \\
  --subnet-ids subnet-0a1 subnet-0b1</code></pre><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Key Exam Distinction</strong>
<p>VPC Peering is <strong>not transitive</strong> — if VPC A peers with B, and B peers with C, A cannot reach C through B. Transit Gateway solves this by acting as a Layer 3 hub with its own route tables, enabling segmented (non-transitive-by-design) or fully-meshed topologies via route table associations/propagations.</p>
</div>
</div><h3 id="hybrid-connectivity">1.2 Hybrid Connectivity (On-Premises Integration)</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Option</th><th>Bandwidth</th><th>Latency</th><th>Encryption</th><th>Use case</th></tr>
</thead>
<tbody>
<tr><td><strong>Site-to-Site VPN</strong></td><td>Up to ~1.25 Gbps/tunnel</td><td>Higher (internet)</td><td>IPsec, always encrypted</td><td>Quick setup, backup path, low-medium bandwidth</td></tr>
<tr><td><strong>AWS Direct Connect (DX)</strong></td><td>50 Mbps–400 Gbps</td><td>Low, consistent</td><td>Not encrypted by default (pair with VPN over DX or MACsec)</td><td>Sustained high-throughput, predictable latency</td></tr>
<tr><td><strong>DX + VPN (encrypted DX)</strong></td><td>DX bandwidth</td><td>Low</td><td>Encrypted</td><td>Compliance requiring both low latency and encryption</td></tr>
<tr><td><strong>Transit Gateway + DX Gateway</strong></td><td>Aggregate</td><td>Low</td><td>Per-VPN if layered</td><td>Multiple VPCs across multiple accounts/Regions over one DX connection</td></tr>
</tbody>
</table>
</div><pre><code># Create a Direct Connect gateway and associate a Transit Gateway
aws directconnect create-direct-connect-gateway --direct-connect-gateway-name org-dxgw --amazon-side-asn 64512
aws directconnect create-direct-connect-gateway-association \\
  --direct-connect-gateway-id dxgw-abcd1234 \\
  --gateway-id tgw-0123456789abcdef0</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Resiliency</strong>
<p>AWS recommends at minimum two DX connections at two different locations (or one DX + one VPN as backup) for production. Use the <strong>DX Resiliency Toolkit</strong> guidance (development, high, and max resiliency models) to size redundancy correctly for the exam.</p>
</div>
</div><p><strong>Direct Connect Gateway</strong> lets one DX connection's <strong>private</strong> virtual interface reach many VPCs/VPGs across accounts and Regions without a separate BGP session per VPC — the answer whenever a question asks for "inter-Region VPC access over Direct Connect without per-VPC connections." Note Direct Connect connects on-prem to a VPC only — it cannot connect two VPCs to each other directly.</p><h3 id="hybrid-dns">1.3 Hybrid DNS</h3><ul>
<li><strong>Route 53 Resolver</strong> provides two endpoint types for hybrid DNS:
        <ul>
<li><strong>Inbound endpoint</strong>: lets on-premises resolvers query AWS-hosted private hosted zones</li>
<li><strong>Outbound endpoint</strong> + <strong>Resolver rules</strong>: lets VPC resources resolve on-premises domains, forwarding specific domains to on-prem DNS servers</li>
</ul>
</li>
<li><strong>Route 53 Resolver rules</strong> can be shared across accounts via <strong>AWS RAM</strong> and associated with multiple VPCs — critical for centralized hybrid DNS in a multi-account org.</li>
<li>Alternative: <strong>Route 53 Private Hosted Zones</strong> shared/associated across VPCs (same or cross-account via authorization) for AWS-internal private DNS, no on-prem dependency.</li>
<li>For a <strong>hub-and-spoke shared-services VPC</strong> serving private DNS to every account: put a private hosted zone on the hub VPC, VPC-peer each spoke VPC to it, then programmatically <strong>associate</strong> each spoke VPC with that one hosted zone — pointing each spoke's own Route 53 NS records at the hub does not work for private zones.</li>
</ul><pre><code>aws route53resolver create-resolver-endpoint \\
  --creator-request-id "$(uuidgen)" \\
  --direction OUTBOUND \\
  --security-group-ids sg-0123456789abcdef0 \\
  --ip-addresses SubnetId=subnet-0a1 SubnetId=subnet-0b1</code></pre><h3 id="network-segmentation-monitoring">1.4 Network Segmentation and Traffic Monitoring</h3><ul>
<li><strong>Segmentation</strong>: separate subnets per tier (public/app/data) and per environment; use security groups (stateful, instance-level) as the primary segmentation control and NACLs (stateless, subnet-level) for coarse, defense-in-depth blocking (e.g., explicit deny of a malicious CIDR).</li>
<li><strong>IP addressing at scale</strong>: plan non-overlapping CIDR ranges across accounts/VPCs up front — overlapping CIDRs block peering/TGW attachment later. Use <strong>IPAM (VPC IP Address Manager)</strong> to centrally plan, track, and auto-allocate CIDRs across the organization.</li>
<li><strong>Traffic monitoring/troubleshooting tools</strong>:
        <ul>
<li><strong>VPC Flow Logs</strong>: IP traffic metadata (accept/reject) to CloudWatch Logs, S3, or Kinesis Data Firehose — first stop for "why is traffic being blocked/allowed."</li>
<li><strong>VPC Reachability Analyzer</strong>: static, config-based path analysis between two resources without generating traffic — quickly explains "why can't A reach B" (SG/NACL/route table misconfig).</li>
<li><strong>Traffic Mirroring</strong>: copies actual packet traffic from an ENI to an analysis target (e.g., an IDS appliance) for deep packet inspection.</li>
<li><strong>Amazon CloudWatch Network Manager / Network Access Analyzer</strong>: validates network access against intended security posture at scale.</li>
</ul>
</li>
<li>Keeping cross-account traffic entirely off the public internet rules out IPSec VPN tunnels and third-party VPN appliances (both traverse the internet); use <strong>VPC Peering</strong> plus <strong>VPC Flow Logs → CloudWatch Logs → cross-account subscription filter</strong> to a central security account instead.</li>
<li>Only <strong>one Virtual Private Gateway (VGW) can be attached to a VPC at a time</strong> — to add HA to an existing Site-to-Site VPN, add a second <strong>Customer Gateway</strong> in a different on-prem data center (a second dual-tunnel connection to the same VGW), not a second VGW.</li>
<li>A <strong>forward (outbound) proxy</strong> deployed in a VPC, with default internet routes removed and URL/domain-based allow-rules configured on the proxy, is the standard way to restrict what external destinations instances can reach (e.g., "only allow calls to a specific vendor's update endpoint") — a NAT Gateway alone has no URL-filtering capability, it only provides address translation.</li>
<li>For <strong>centralized traffic inspection</strong> across many spoke VPCs/accounts: connect every spoke VPC to a <strong>shared Transit Gateway</strong>, and route egress (and/or ingress) traffic through a central inspection VPC fronted by a <strong>Gateway Load Balancer (GWLB)</strong> distributing flows across a fleet of firewall appliances — the standard hub-and-spoke pattern for enforcing one common set of network security controls without deploying a firewall per VPC.</li>
</ul>` },
        { id: "org-security-controls", label: "Prescribe Security Controls", type: "recommended",
          description: "IAM, network-level controls, encryption and key management, centralized security auditing.",
          content: `<h3 id="iam">2.1 Identity and Access Management</h3><ul>
<li><strong>IAM users/roles/policies</strong>: prefer <strong>roles</strong> (temporary credentials via STS) over long-lived IAM user access keys, especially for workloads and cross-account access.</li>
<li><strong>AWS IAM Identity Center</strong> (formerly AWS SSO): centralized human-user access across all accounts in an AWS Organization, federated with an external IdP (Okta, Entra ID, etc.) via SAML 2.0/SCIM, using <strong>permission sets</strong> mapped to accounts. It supports SSO to <strong>web-browser-based business applications only</strong> — a public-facing <strong>mobile app</strong> needing federated login from a custom or social IdP needs a custom SAML/OIDC solution paired with STS (<code>AssumeRoleWithWebIdentity</code>) or Amazon Cognito instead.</li>
<li><strong>Cross-account access</strong> pattern: a role in Account B has a trust policy allowing <code>sts:AssumeRole</code> from a principal in Account A; Account A's users/roles then <code>AssumeRole</code> to operate in Account B — no shared long-term credentials. A <strong>resource-based policy</strong> (attached to the resource itself) is the alternative when a user needs to access a resource in another account <em>without giving up their own account's permissions</em> — different from assuming a role, which swaps the user into that role's permission set entirely.</li>
<li>When a <strong>third party</strong> (not another of your own accounts) needs to assume a role into your account — e.g., a SaaS vendor or a logistics partner — have the third party generate an <strong>External ID</strong> and put it in the IAM role's trust policy's <code>sts:ExternalId</code> condition; the third party then supplies both the role ARN and the External ID when calling <code>AssumeRole</code>. This closes the <strong>confused deputy problem</strong>, where the third party's own AWS account could otherwise be tricked into assuming the role on a different customer's behalf.</li>
<li>For a corporate identity store that <strong>isn't SAML 2.0-compatible</strong> (e.g., plain LDAP with no SAML front end), build a custom <strong>identity broker application</strong>: it authenticates the user against the on-prem LDAP/AD server, then calls STS <code>AssumeRole</code> (not <code>GetFederationToken</code>) to mint temporary credentials scoped to an IAM role, which the user's client then uses to access AWS — the broker itself never issues AWS credentials directly.</li>
<li>Grant an external auditor read-only, revocable access across every account under audit by creating an <strong>IAM role in each account</strong> with a trust policy naming the auditor's AWS account (or IAM ARN) as principal and a read-only permissions policy attached — never hand out IAM user long-term credentials or share existing user passwords, even for a time-boxed compliance engagement.</li>
</ul><pre><code># Assume a cross-account role
aws sts assume-role \\
  --role-arn arn:aws:iam::222222222222:role/CrossAccountAdmin \\
  --role-session-name session1</code></pre><p><strong>Third-party IdP integration</strong>: use <strong>IAM Identity Provider</strong> objects (SAML or OIDC) to trust an external IdP directly for workload identity federation (e.g., GitHub Actions OIDC → IAM role), avoiding stored AWS credentials in CI/CD.</p><h3 id="network-level-controls">2.2 Network-Level Controls</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Control</th><th>Level</th><th>Stateful?</th><th>Default</th></tr>
</thead>
<tbody>
<tr><td><strong>Security Group</strong></td><td>ENI/instance</td><td>Stateful (return traffic auto-allowed)</td><td>Deny all inbound, allow all outbound</td></tr>
<tr><td><strong>Network ACL</strong></td><td>Subnet</td><td>Stateless (must define both directions)</td><td>Default NACL allows all; custom NACL denies all</td></tr>
<tr><td><strong>Route Table</strong></td><td>Subnet</td><td>N/A</td><td>Controls next-hop, not permit/deny</td></tr>
</tbody>
</table>
</div><div class="callout warn">
<span class="callout-icon">⚠️</span>
<div class="callout-body">
<strong>Exam Trap</strong>
<p>NACLs evaluate rules <strong>in numeric order</strong> and stop at first match — rule numbering matters. Security groups evaluate <strong>all rules</strong> (most permissive wins, since they're allow-only, no explicit deny).</p>
</div>
</div><h3 id="encryption-key-management">2.3 Encryption and Key Management</h3><ul>
<li><strong>AWS KMS</strong>: centralized key management; supports <strong>AWS managed keys</strong>, <strong>customer managed keys (CMKs)</strong>, and <strong>imported key material (BYOK)</strong>. Multi-Region keys let you replicate the <em>same</em> key material across Regions for DR without re-encrypting data.</li>
<li>To use key material generated by an <strong>on-premises HSM</strong> instead of AWS-generated material: create the KMS key with <strong>no key material</strong> and origin <code>EXTERNAL</code>, generate the key on the HSM, then import it using the public key and import token KMS provides — never create a key with origin <code>AWS_KMS</code> (AWS-generated material) and try to overwrite it afterward, which risks data loss on any object already encrypted under the original material. An <code>EXTERNAL</code>-origin key has no automatic annual rotation and must be re-imported/rotated manually.</li>
<li><strong>Envelope encryption</strong>: KMS encrypts a data key, not the data itself directly for large payloads — the data key encrypts the data locally (used by S3, EBS, RDS encryption under the hood).</li>
<li><strong>AWS Certificate Manager (ACM)</strong>: free public/private TLS certs for ELB/CloudFront/API Gateway, auto-renewal; <strong>ACM Private CA</strong> for internal PKI.</li>
<li><strong>Encryption in transit</strong>: TLS termination at ALB/NLB/CloudFront/API Gateway, or end-to-end via mutual TLS.</li>
</ul><pre><code>aws kms create-key --description "Org data-at-rest key" --multi-region
aws kms replicate-key --key-id mrk-1234abcd... --replica-region us-west-2</code></pre><h3 id="security-auditing-notification">2.4 Centralized Security Auditing and Notification</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Service</th><th>Purpose</th></tr>
</thead>
<tbody>
<tr><td><strong>AWS CloudTrail</strong> (Organization trail)</td><td>API call history across every account in the Org, delivered to one central S3 bucket</td></tr>
<tr><td><strong>IAM Access Analyzer</strong></td><td>Finds resources shared outside the account/Org boundary (S3 buckets, IAM roles, KMS keys, etc.)</td></tr>
<tr><td><strong>AWS Security Hub</strong></td><td>Aggregates findings from GuardDuty, Inspector, Macie, Config, third-party tools into one dashboard; supports Org-wide delegated administration</td></tr>
<tr><td><strong>Amazon GuardDuty</strong></td><td>Threat detection (VPC Flow Logs, DNS logs, CloudTrail); Org-wide via delegated administrator account</td></tr>
<tr><td><strong>Amazon Inspector</strong></td><td>Automated vulnerability scanning for EC2, ECR images, Lambda</td></tr>
<tr><td><strong>Amazon Detective</strong></td><td>Investigates and visualizes root cause after a GuardDuty finding</td></tr>
</tbody>
</table>
</div><ul>
<li><strong>Amazon Macie</strong> uses ML to automatically discover and classify <strong>PII</strong> in S3 buckets — the direct answer for "find sensitive data across many S3 buckets without writing custom scanning code." Pair it with <strong>CloudTrail</strong> data-event tracking of S3 <code>GetObject</code> calls to determine whether flagged PII objects have actually been accessed; Macie does data discovery, CloudTrail does the access audit trail — neither one alone covers both halves of that requirement.</li>
<li>To enforce "EC2 instances must launch only from pre-approved AMIs" <em>without</em> blocking a fast-moving CI/CD pipeline (i.e., detect-and-remediate after the fact rather than a hard IAM/SCP deny that would block deploys): use the AWS Config managed rule <code>approved-amis-by-id</code> (or a scheduled Lambda that lists running instances and checks their AMI) to catch non-compliant launches, auto-terminate via Lambda, and notify via SNS — Amazon Inspector has no AMI-approval-checking capability, and a hard IAM policy restriction is the wrong tool whenever the requirement explicitly calls for least development-process impact.</li>
</ul><p>A CloudTrail trail only covers <strong>global services</strong> (IAM, STS, CloudFront, Route 53) when <code>--include-global-service-events</code> is set, and only spans every Region when <code>--is-multi-region-trail</code> is also set — both flags, one trail, one destination S3 bucket with IAM roles + bucket policy + MFA Delete is the standard "durable, tamper-evident, org-wide audit log" answer. <strong>AWS Config</strong> (not CloudWatch) is the service to monitor for unexpected org membership/config changes, paired with EventBridge + SNS for near-real-time alerting.</p><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Pattern for the Exam</strong>
<p>Designate a <strong>Security Tooling / Audit account</strong> as the Security Hub, GuardDuty, and CloudTrail Org delegated administrator, and a separate <strong>Log Archive account</strong> as the destination for the Organization CloudTrail trail and Config aggregator — least-privilege separation of "who can see findings" vs "who can tamper with logs."</p>
</div>
</div>` },
        { id: "org-reliable-resilient", label: "Design Reliable and Resilient Architectures", type: "recommended",
          description: "RTO/RPO-driven DR strategy, automated recovery patterns, backup and restoration.",
          content: `<h3 id="dr-strategy-selection">3.1 RTO/RPO-Driven DR Strategy Selection</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Strategy</th><th>RTO</th><th>RPO</th><th>Cost</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td><strong>Backup and Restore</strong></td><td>Hours</td><td>Hours</td><td>$</td><td>Backups (e.g., S3, AMI, RDS snapshot) in a second Region; restore on disaster</td></tr>
<tr><td><strong>Pilot Light</strong></td><td>Tens of minutes</td><td>Minutes</td><td>$$</td><td>Core data replicated live (e.g., RDS read replica); minimal/no compute running, scaled up on failover</td></tr>
<tr><td><strong>Warm Standby</strong></td><td>Minutes</td><td>Seconds–minutes</td><td>$$$</td><td>Scaled-down but fully functional stack always running in DR Region; scale up on failover</td></tr>
<tr><td><strong>Multi-Site Active/Active</strong></td><td>Near-zero</td><td>Near-zero</td><td>$$$$</td><td>Full production capacity live in 2+ Regions simultaneously, traffic split via Route 53/Global Accelerator</td></tr>
</tbody>
</table>
</div><p><strong>AWS Elastic Disaster Recovery (DRS)</strong>: continuous block-level replication of on-prem/EC2 servers to a low-cost staging area in AWS, with fast full-instance launch on failover — the managed way to implement pilot light/warm standby for lift-and-shift workloads.</p><h3 id="automated-recovery-patterns">3.2 Automated Recovery Patterns</h3><ul>
<li><strong>Multi-AZ everything</strong>: RDS Multi-AZ (synchronous standby, automatic failover), ELB across AZs, Auto Scaling group <code>min</code> ≥ 2 spanning ≥2 AZs.</li>
<li><strong>Health-check-driven failover</strong>: Route 53 health checks + failover routing policy for automatic Region-level failover of DNS.</li>
<li><strong>Self-healing compute</strong>: ASG replaces unhealthy instances automatically; combine with ALB target-group health checks (application-level) rather than just EC2 status checks (infra-level) for faster/more accurate detection.</li>
<li><strong>Scale-up vs scale-out</strong>: scale-up (vertical, bigger instance) is simpler but has ceilings and requires downtime for some engines; scale-out (horizontal, more instances) is the default HA pattern for stateless tiers — exam favors scale-out plus stateless design (session state externalized to ElastiCache/DynamoDB) wherever possible.</li>
</ul><h3 id="backup-restoration-strategy">3.3 Backup and Restoration Strategy</h3><ul>
<li><strong>AWS Backup</strong>: centralized, policy-based (backup plans) backup across EC2/EBS/RDS/DynamoDB/EFS/FSx/Storage Gateway, with <strong>cross-account and cross-Region copy</strong> built in — the exam-preferred answer for "centralize backup policy across an Organization" (via <strong>AWS Backup + Organizations integration / backup policies</strong>).</li>
<li><strong>S3</strong> durability/versioning: S3 Standard is 11 nines durability <em>within</em> a Region; use <strong>Cross-Region Replication (CRR)</strong> and <strong>S3 Object Lock</strong> (WORM) for ransomware/compliance-grade retention.</li>
<li><strong>RPO consideration</strong>: continuous backup (e.g., DynamoDB point-in-time recovery, RDS automated backups with transaction logs) gives near-zero RPO; scheduled snapshots give RPO = snapshot interval.</li>
</ul><pre><code>aws backup create-backup-plan --backup-plan file://backup-plan.json
aws backup create-backup-vault --backup-vault-name org-central-vault</code></pre>` },
        { id: "org-multi-account", label: "Design a Multi-Account AWS Environment", type: "recommended",
          description: "AWS Organizations and Control Tower, multi-account logging, cross-account resource sharing.",
          content: `<h3 id="organizations-control-tower">4.1 AWS Organizations and Control Tower</h3><ul>
<li><strong>AWS Organizations</strong>: management account + member accounts organized into <strong>Organizational Units (OUs)</strong>; <strong>Service Control Policies (SCPs)</strong> set the <em>maximum</em> allowed permissions per OU/account (they never grant permissions by themselves — IAM policies still must explicitly allow an action).</li>
<li><strong>AWS Control Tower</strong>: opinionated automation on top of Organizations — sets up a <strong>Landing Zone</strong> with a Log Archive account, an Audit/Security account, mandatory and strongly-recommended <strong>guardrails</strong> (implemented as SCPs and AWS Config rules), and <strong>Account Factory</strong> for standardized new-account vending.</li>
<li>Common account structure: <code>Management</code> (root, billing only, no workloads) → OUs like <code>Security</code>, <code>Infrastructure</code>, <code>Workloads/Prod</code>, <code>Workloads/NonProd</code>, <code>Sandbox</code>, each with their own accounts.</li>
<li>An account <strong>invited</strong> into the Organization (vs. one <strong>created</strong> directly from the management account) does <em>not</em> automatically grant the management account administrative control — you must still create an <code>OrganizationAccountAccessRole</code> IAM role in that member account trusting the management account before it can assume in. Inviting from the management account to every member account (rather than each member inviting the management account) is also the least-effort direction, since only the management account can send/manage invitations.</li>
<li>A default <strong>FullAWSAccess</strong> SCP is attached to every root/OU/account and allows everything until you attach your own; an explicit <strong>Deny</strong> anywhere up the hierarchy always wins over an <strong>Allow</strong> elsewhere, and anything not explicitly allowed by every SCP level down to the account is implicitly denied. SCPs only ever <em>restrict</em> the ceiling of permissions — the account/user/role still needs an actual IAM <strong>Allow</strong> policy to do anything, and <strong>SCPs never affect service-linked roles</strong> (exempt so AWS services keep integrating with Organizations regardless of a Deny SCP).</li>
<li>AWS recommends against attaching new/modified SCPs directly to the <strong>root</strong> without testing — attach to an OU first (or a temporary "Onboarding" OU with a looser SCP) and migrate accounts in small batches so you don't lock users out org-wide.</li>
</ul><pre><code>aws organizations create-organizational-unit --parent-id r-abcd --name Workloads-Prod
aws organizations create-policy --name DenyLeaveOrg --type SERVICE_CONTROL_POLICY \\
  --content file://scp-deny-leave-org.json
aws organizations attach-policy --policy-id p-examplepolicyid111 --target-id ou-abcd-11111111</code></pre><h3 id="multi-account-logging">4.2 Multi-Account Logging and Event Notification</h3><ul>
<li>Aggregate CloudTrail, Config, and GuardDuty findings into a <strong>dedicated Log Archive / Security account</strong> (write-once, restricted access) — never the account generating the workload, to preserve log integrity if that account is compromised.</li>
<li><strong>Amazon EventBridge</strong> cross-account event bus: forward security/operational events (e.g., a GuardDuty finding) from every member account to a central account's event bus for automated response (e.g., trigger a Lambda remediation or a Slack notification via SNS/Chatbot).</li>
<li><strong>AWS Chatbot</strong> or SNS → email/Slack/Teams for org-wide alert routing.</li>
</ul><h3 id="cross-account-resource-sharing">4.3 Cross-Account Resource Sharing</h3><ul>
<li><strong>AWS Resource Access Manager (RAM)</strong>: share resources (subnets, TGW attachments, Route 53 Resolver rules, License Manager configs, ACM Private CA) across accounts/OUs <em>without</em> duplicating them or writing custom cross-account IAM policies for each resource type.</li>
<li><strong>Shared VPC</strong> (subnets shared via RAM into multiple accounts) centralizes networking ownership (network team owns the VPC/subnets) while application teams deploy resources (EC2, RDS, Lambda-in-VPC) into the shared subnets from their own accounts — the standard exam answer for "one network team, many app teams, avoid VPC peering sprawl."</li>
<li><strong>RAM trusted access with Organizations</strong> (<code>enable-sharing-with-aws-organizations</code>) is the simplest way to let a trusted AWS service operate org-wide — it auto-creates the needed service-linked role for you, so manually crafting a service-linked role's trust/permissions policy is unnecessary (and, for a service-linked role, its trust policy can't be edited anyway).</li>
</ul><pre><code>aws ram create-resource-share --name shared-prod-subnets \\
  --resource-arns arn:aws:ec2:us-east-1:111111111111:subnet/subnet-0a1 \\
  --principals 222222222222 333333333333</code></pre>` },
        { id: "org-cost-optimization", label: "Determine Cost Optimization and Visibility Strategies",
          description: "Cost monitoring tools and cost-visibility practices across a multi-account org.",
          content: `<h3 id="cost-monitoring-tools">5.1 Cost Monitoring Tools</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Tool</th><th>Purpose</th></tr>
</thead>
<tbody>
<tr><td><strong>AWS Cost Explorer</strong></td><td>Visualize/forecast spend, filter/group by tag, service, account</td></tr>
<tr><td><strong>AWS Cost and Usage Report (CUR)</strong></td><td>Most granular, hourly line-item data → Athena/QuickSight for custom analysis</td></tr>
<tr><td><strong>AWS Budgets</strong></td><td>Alerts when actual/forecasted cost or usage exceeds a threshold</td></tr>
<tr><td><strong>AWS Trusted Advisor</strong></td><td>Checks across cost, performance, security, fault tolerance, service limits (some checks require Business/Enterprise Support)</td></tr>
<tr><td><strong>AWS Pricing Calculator</strong></td><td>Pre-purchase "what will this cost" estimation</td></tr>
</tbody>
</table>
</div><p>Enable <strong>Cost Explorer + CUR at the Organization management account</strong> with consolidated billing to see cost across all member accounts in one place. Consolidated billing shares Reserved Instance/Savings Plan discounts automatically across every member account; the <strong>payer (management) account</strong> can turn this off per member account in Billing Preferences — there's no per-account "opt out" and removing the account from the Org is not the minimal fix.</p><h3 id="purchasing-options">5.2 Purchasing Options</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Option</th><th>Discount vs On-Demand</th><th>Commitment</th><th>Flexibility</th></tr>
</thead>
<tbody>
<tr><td><strong>On-Demand</strong></td><td>Baseline</td><td>None</td><td>Full</td></tr>
<tr><td><strong>Savings Plans (Compute)</strong></td><td>Up to ~66%</td><td>1 or 3 yr $/hr commitment</td><td>Any instance family/Region/OS, EC2+Fargate+Lambda</td></tr>
<tr><td><strong>Savings Plans (EC2 Instance)</strong></td><td>Higher than Compute SP</td><td>1 or 3 yr</td><td>Locked to instance family + Region</td></tr>
<tr><td><strong>Reserved Instances</strong></td><td>Up to ~72%</td><td>1 or 3 yr</td><td>Least flexible (esp. Standard RI); Convertible RI adds some flexibility</td></tr>
<tr><td><strong>Spot Instances</strong></td><td>Up to ~90%</td><td>None</td><td>Can be reclaimed with 2-min warning — for fault-tolerant/flexible workloads</td></tr>
</tbody>
</table>
</div><p>Comparing purchase options for predictable vs. bursty load: <strong>Compute Savings Plans</strong> (flexible across instance family/EC2/Fargate/Lambda) for steady-state compute, <strong>Spot</strong> for scale-out peaks, and a <strong>1-year All Upfront Reserved Instance</strong> for a database with fully predictable usage gives the deepest discount — Partial/No Upfront RIs save less for the same term.</p><h3 id="right-sizing-tagging-cost-allocation">5.3 Right-Sizing, Tagging, and Cost Allocation</h3><ul>
<li><strong>AWS Compute Optimizer</strong>: ML-based right-sizing recommendations for EC2, EBS, Lambda, ECS on Fargate.</li>
<li><strong>Amazon S3 Storage Lens</strong>: org-wide S3 usage/activity visibility, identifies buckets to move to cheaper storage classes.</li>
<li><strong>Tagging strategy</strong>: enforce mandatory cost-allocation tags (e.g., <code>CostCenter</code>, <code>Environment</code>, <code>Owner</code>) via <strong>AWS Config rules / Tag Policies (Organizations)</strong> or SCPs that deny resource creation without required tags — then activate those as <strong>cost allocation tags</strong> in Billing so they appear in Cost Explorer/CUR breakdowns.</li>
<li>To enforce tagging <em>proactively at creation time</em> via centralized, self-service infrastructure-as-code (rather than reactively flagging untagged resources after the fact): use the <strong>CloudFormation <code>Resource Tags</code> property</strong> in templates plus <strong>AWS Service Catalog</strong> products/portfolios that auto-tag whatever a user provisions through them — AWS Config can only detect missing tags after creation and doesn't tag resources itself, and Systems Manager Automation targets existing resources, not the moment of creation. Bulk-tag any pre-existing untagged resources first with the <strong>Tag Editor</strong>, then lock in enforcement with an <strong>SCP</strong> that denies resource creation lacking the required tags.</li>
</ul>` },
      ]},
      { id: "new-solutions", title: "02 · New Solutions (29%)", color: "var(--c-teal)", items: [
        { id: "ns-deployment-strategy", label: "Design a Deployment Strategy to Meet Business Requirements", type: "recommended",
          content: `<h3 id="infrastructure-as-code">1.1 Infrastructure as Code</h3><ul>
<li><strong>AWS CloudFormation</strong>: declarative, native IaC. <strong>Nested stacks</strong> for reuse; <strong>StackSets</strong> to deploy the same template across many accounts/Regions (the exam answer for "deploy a baseline stack to every account in the Organization").</li>
<li><strong>AWS CDK</strong>: imperative code (TypeScript/Python/etc.) that synthesizes to CloudFormation — preferred when the team wants programming-language constructs (loops, conditionals, testing) over raw templates.</li>
<li><strong>Change Sets</strong>: preview what a stack update will actually do before executing — the answer whenever a question asks about "safely preview infrastructure changes."</li>
<li>CloudFormation <strong>DeletionPolicy</strong>: <code>Retain</code> keeps a resource and its contents intact after stack deletion (use for S3 buckets you must not lose); <code>Snapshot</code> is RDS-specific and backs up to a snapshot before deleting the running instance; the default (no policy) is <code>Delete</code>. Don't set <code>Retain</code> on an RDS instance expecting a backup — that just leaves the instance running, unstopped.</li>
<li>Use a CloudFormation <strong>dynamic reference</strong> (<code>{{resolve:secretsmanager:...}}</code>) to pull a value straight from Secrets Manager (or SSM Parameter Store) into a resource property at deploy time — e.g., as the <code>MasterUserPassword</code> of an <code>AWS::RDS::DBInstance</code> — so the plaintext secret never appears in the template, the stack's parameters, or CloudFormation's change-set diff output.</li>
<li>To roll a new AMI out to an existing Auto Scaling group's instances (not just newly-launched ones) purely by calling <code>UpdateStack</code>, without a separate replace-instances step: add an <strong>UpdatePolicy</strong> attribute of type <code>AutoScalingRollingUpdate</code> to the <code>AWS::AutoScaling::AutoScalingGroup</code> resource. A bare <strong>Change Set</strong> only previews/updates the Launch Template — existing running instances are left on the old AMI until they're replaced some other way.</li>
</ul><pre><code>aws cloudformation deploy --template-file template.yaml --stack-name my-stack \\
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation create-stack-set --stack-set-name org-baseline \\
  --template-body file://baseline.yaml --permission-model SERVICE_MANAGED \\
  --auto-deployment Enabled=true,RetainStacksOnAccountRemoval=false</code></pre><h3 id="cicd-deployment-strategies">1.2 CI/CD and Deployment Strategies</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Strategy</th><th>Downtime</th><th>Rollback speed</th><th>Risk</th></tr>
</thead>
<tbody>
<tr><td><strong>All-at-once</strong></td><td>Yes</td><td>Slow (redeploy)</td><td>Highest</td></tr>
<tr><td><strong>Rolling</strong></td><td>No (partial capacity dip)</td><td>Slow</td><td>Medium</td></tr>
<tr><td><strong>Rolling with additional batch</strong></td><td>No</td><td>Medium</td><td>Medium</td></tr>
<tr><td><strong>Blue/Green</strong></td><td>No</td><td>Instant (flip traffic back)</td><td>Low</td></tr>
<tr><td><strong>Canary</strong></td><td>No</td><td>Fast (shift % of traffic back)</td><td>Lowest</td></tr>
</tbody>
</table>
</div><ul>
<li><strong>AWS CodePipeline</strong> orchestrates <strong>CodeCommit/GitHub → CodeBuild → CodeDeploy</strong>; <strong>CodeDeploy</strong> natively supports in-place and blue/green deployments for EC2/ECS/Lambda.</li>
<li><strong>Lambda</strong>: use <strong>weighted alias traffic shifting</strong> (linear/canary via CodeDeploy) to gradually shift invocations to a new version, with CloudWatch alarm-triggered automatic rollback.</li>
<li><strong>ECS/EKS</strong>: blue/green via CodeDeploy (ECS) or rolling/blue-green via native Kubernetes deployment strategies + a service mesh or ALB weighted target groups.</li>
<li><strong>Elastic Beanstalk</strong> also supports true blue/green: stand up a separate <strong>Staging</strong> environment, deploy the new version there, then perform a <strong>CNAME swap</strong> with Production to cut traffic over instantly and roll back just as fast by swapping again — faster and safer for this platform than its <em>Immutable</em> policy (new instances, same environment) when the requirement is near-instant rollback on every deploy. Elastic Beanstalk's own deployment policies (All at once, Rolling, Rolling with additional batch, Immutable, Traffic splitting) apply within a single environment; CNAME swap is the cross-environment option.</li>
<li>An <strong>ALB</strong> can serve multiple domains' TLS certificates off a <strong>single secure listener</strong> using <strong>SNI</strong> — just bind all the certificates to the listener and ALB picks the right one per client automatically, with no re-provisioning needed when a new domain is added (unlike adding a SAN per domain, which requires reissuing the certificate each time). A <strong>Gateway Load Balancer does not support SNI</strong> at all.</li>
<li><strong>AWS SAM</strong> + CodeBuild/CodeDeploy/CodePipeline is the standard serverless (Lambda-based) CI/CD stack — Elastic Beanstalk targets EC2-hosted apps, not serverless ones, and Systems Manager Automation is for instance/runbook automation, not app build/deploy pipelines.</li>
</ul><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Key Exam Distinction</strong>
<p>Blue/green flips <strong>all</strong> traffic to the new environment at once (or in one controlled cutover) and can flip back instantly; canary/linear shifts traffic gradually in percentages with automatic rollback on alarm. Both are zero-downtime — the difference is <em>how much</em> traffic is exposed to the new version before rollback would trigger.</p>
</div>
</div><h3 id="configuration-management">1.3 Configuration Management and Managed-Service Adoption</h3><ul>
<li><strong>AWS Systems Manager</strong>: State Manager (enforce config state), Patch Manager (automated patching), Run Command (ad hoc execution at scale), Parameter Store (config/secrets), Automation (runbooks) — the toolset for "reduce patching/config overhead" answers.</li>
<li>Prefer managed services (Aurora over self-managed MySQL on EC2, Fargate over self-managed ECS EC2 capacity, managed NAT Gateway over self-managed NAT instance) whenever the requirement is to "reduce operational overhead" — a very common phrase pointing to the managed-service answer.</li>
</ul>` },
        { id: "ns-business-continuity", label: "Design a Solution to Ensure Business Continuity", type: "recommended",
          content: `<h3 id="route53-routing-resiliency">2.1 Route 53 Routing for Resiliency</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Routing policy</th><th>Use case</th></tr>
</thead>
<tbody>
<tr><td><strong>Simple</strong></td><td>Single resource, no health checks</td></tr>
<tr><td><strong>Failover</strong></td><td>Active-passive DR — primary record with health check, secondary as failover</td></tr>
<tr><td><strong>Latency-based</strong></td><td>Route to the Region with lowest latency for the user</td></tr>
<tr><td><strong>Geolocation</strong></td><td>Route based on user's geographic location (compliance/data residency)</td></tr>
<tr><td><strong>Geoproximity</strong> (traffic flow)</td><td>Shift traffic between Regions using a "bias" value</td></tr>
<tr><td><strong>Weighted</strong></td><td>Percentage-based split, e.g., canary or A/B</td></tr>
<tr><td><strong>Multi-value answer</strong></td><td>Return multiple healthy IPs, client-side load balancing with health checks</td></tr>
</tbody>
</table>
</div><p><strong>CloudFront geo restriction</strong> (whitelist/blacklist by country) is the cheap way to block specific countries from a globally-distributed app at the edge — Route 53 geolocation/geoproximity routing policies only control DNS answers, they don't provide CDN-level low-latency delivery or actually block a request.</p><h3 id="data-database-replication">2.2 Data and Database Replication for BC</h3><ul>
<li><strong>RDS Multi-AZ</strong>: synchronous standby in another AZ, automatic failover (same Region) — availability, not primarily a read-scaling feature.</li>
<li><strong>RDS Read Replicas</strong> (can be cross-Region): asynchronous, for read scaling; a cross-Region replica can be <strong>promoted</strong> to standalone for DR, but that's a manual/scripted failover, not automatic.</li>
<li><strong>Aurora Global Database</strong>: one primary Region plus up to 10 secondary Regions (secondary clusters), sub-second replication lag via the storage layer, and a secondary can typically be promoted in under a minute for cross-Region DR with much lower RPO/RTO than standard cross-Region read replicas.</li>
<li><strong>S3 Cross-Region Replication (CRR)</strong>, <strong>DynamoDB Global Tables</strong> (multi-Region, multi-active, last-writer-wins) for other data stores.</li>
<li><strong>Amazon Redshift cross-region snapshot copy</strong>: enabling the feature alone is not enough for a <strong>KMS-encrypted</strong> cluster — since KMS keys are Region-specific, you must also create a <strong>snapshot copy grant</strong> for a master key in the destination Region so Redshift can perform encryption operations there before snapshots can be copied over.</li>
</ul><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Correction: Aurora Global Database Secondary Region Limit</strong>
<p>The source material stated Aurora Global Database supports "up to 5 secondary Regions." Current AWS documentation (Aurora User Guide, Replicating Aurora MySQL DB clusters across AWS Regions) states a global database supports <strong>one primary cluster and up to 10 secondary read-only clusters</strong>, each of which can have up to 16 Aurora Replicas. Corrected above.</p>
</div>
</div><h3 id="dr-testing-automated-recovery">2.3 DR Testing and Automated Recovery</h3><ul>
<li>Regularly <strong>test failover</strong> (not just configure it) — e.g., scheduled Route 53 failover drills, AWS Fault Injection Service to inject failure and validate automated recovery actually works.</li>
<li><strong>AWS Fault Injection Service (FIS)</strong>: chaos-engineering service (formerly "Fault Injection Simulator") to simulate AZ outages, instance termination, API throttling, etc., in a controlled way to validate resiliency assumptions before a real disaster.</li>
<li>Centralized monitoring (CloudWatch composite alarms, EventBridge rules) that trigger automated remediation (e.g., Lambda restarts a service, ASG replaces instances) rather than relying on a human to notice.</li>
</ul>` },
        { id: "ns-security-controls", label: "Determine Security Controls Based on Requirements", type: "recommended",
          content: `<h3 id="least-privilege-iam">3.1 Least-Privilege IAM Design</h3><ul>
<li>Write IAM policies scoped to specific resources/actions/conditions (not <code>Resource: "*"</code>), use <strong>permissions boundaries</strong> to cap what an IAM role/user can be granted even by someone with <code>iam:CreatePolicy</code> access, and prefer roles over long-lived credentials.</li>
<li><strong>IAM policy conditions</strong> (<code>aws:SourceIp</code>, <code>aws:MultiFactorAuthPresent</code>, <code>aws:PrincipalOrgID</code>) to further restrict access (e.g., require MFA for sensitive actions, restrict API calls to only originate from within the Organization).</li>
<li>For a public mobile/web app logging in via social IdPs, use <strong>Web Identity Federation</strong>: authenticate against the IdP, then call <code>AssumeRoleWithWebIdentity</code> against STS to get temporary credentials mapped to a scoped IAM role — never a hand-rolled Token Vending Machine on a single EC2 instance (a SPOF and a scaling bottleneck). <strong>Amazon Cognito Identity Pools</strong> is the managed version of the same pattern and is generally preferred over a fully custom implementation.</li>
<li>To require IAM-based auth on an <strong>API Gateway</strong> method: set the method's authorization to <code>AWS_IAM</code>, grant the calling principal an <code>execute-api:Invoke</code> policy scoped to the method's ARN, and require callers to <strong>SigV4-sign</strong> every request — this beats a custom Lambda authorizer that validates raw access/secret keys (more code to maintain, and shipping long-term credentials over the wire is a bad practice) whenever the callers are IAM principals rather than end users. Pair it with <strong>AWS X-Ray</strong> for end-to-end request tracing and service maps; CloudWatch Logs shows execution logs but no distributed trace.</li>
<li>An EC2-hosted application that must generate <strong>S3 pre-signed URLs</strong> (or otherwise call AWS APIs) should get its credentials from an <strong>IAM role via an instance profile</strong>, never static keys dropped in <code>~/.aws/credentials</code> — the instance-profile path auto-rotates temporary credentials through IMDS and survives Spot interruptions/replacements without any manual key redistribution.</li>
</ul><h3 id="network-flow-control">3.2 Network Flow Control</h3><p>Reuse security groups/NACLs (see Domain 1 §2.2) at the per-application level: e.g., a 3-tier app's ALB SG allows 443 from <code>0.0.0.0/0</code>, the app-tier SG allows the app port only from the ALB's SG (SG-to-SG reference, not CIDR), and the DB-tier SG allows only from the app-tier SG. ECS <strong>awsvpc</strong> network mode gives each task its own ENI, letting you attach security groups <em>per task</em> and use <strong>IAM roles for tasks</strong> (never pass long-lived IAM credentials into a container via environment variables) — the <strong>bridge</strong> network mode can't have SGs attached at the task level at all. A Fargate task stuck with <strong>CannotPullContainerError</strong> (connection timed out to ECR) means its ENI has no internet route: tasks in <strong>public</strong> subnets need Auto-assign public IP <strong>enabled</strong>; tasks in <strong>private</strong> subnets need it disabled plus a <strong>NAT Gateway in a public subnet</strong> referenced by the private subnet's route table. To lock an S3 bucket down to only traffic from a specific <strong>Gateway VPC endpoint</strong> (no public internet path at all), the bucket policy must use the <code>aws:sourceVpce</code> condition key — <code>aws:SourceIp</code> does not evaluate against traffic arriving via a VPC endpoint, so it silently fails to restrict it; pair the bucket-policy <code>Deny</code>-unless-<code>sourceVpce</code> with an endpoint policy scoped to the bucket and an IAM role on the calling instances for defense in depth.</p><h3 id="attack-mitigation">3.3 Attack Mitigation for Web Applications</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Service</th><th>Protects against</th></tr>
</thead>
<tbody>
<tr><td><strong>AWS WAF</strong></td><td>Layer 7: SQLi, XSS, bad bots, rate-based rules</td></tr>
<tr><td><strong>AWS Shield Standard</strong></td><td>Automatic, free, Layer 3/4 DDoS protection for all customers</td></tr>
<tr><td><strong>AWS Shield Advanced</strong></td><td>Enhanced DDoS protection, 24/7 DRT support, cost protection during attacks, integrates with WAF</td></tr>
<tr><td><strong>Amazon GuardDuty</strong></td><td>Threat detection (compromised credentials, malicious IPs, crypto-mining)</td></tr>
<tr><td><strong>AWS Firewall Manager</strong></td><td>Centrally manage WAF rules/Shield Advanced/Security Groups across accounts in an Organization</td></tr>
</tbody>
</table>
</div><pre><code>aws wafv2 create-web-acl --name protect-alb --scope REGIONAL \\
  --default-action Allow={} --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=protectAlb \\
  --rules file://waf-rules.json</code></pre><h3 id="encryption-patch-compliance">3.4 Encryption and Patch Compliance</h3><p>Same KMS/ACM tools as Domain 1 §2.3, applied per-workload. For patch compliance, <strong>Systems Manager Patch Manager</strong> with <strong>Patch Baselines</strong> and <strong>Maintenance Windows</strong>, reporting compliance via <strong>Systems Manager Compliance</strong> — a required answer whenever "remain compliant with organizational patching standards" appears.</p><ul>
<li><strong>AWS CloudHSM</strong> deployed across <strong>two+ AZs</strong> is the exam's answer whenever an SSL/TLS private key must never leave customer control (vs. ACM, which is free but AWS-managed) — a single-AZ CloudHSM deployment is marked wrong for lacking HA.</li>
<li><strong>S3 SSE-C</strong> (customer-supplied key, not stored by S3) is implied whenever only specific authorized parties — not AWS itself — should be able to decrypt an object; SSE-S3/SSE-KMS both let AWS manage the key material.</li>
<li><strong>CloudFront field-level encryption</strong> protects specific POST fields (e.g., a credit-card number) end-to-end through the whole app stack — distinct from Signed URLs (private-content access control only, no encryption) and Origin Access Control (restricts direct S3 access only).</li>
<li><strong>S3 pre-signed URLs</strong> grant time-limited access directly to an object using the permissions of whoever generated the URL, with no CDN in front — the simplest fit when there's no CloudFront distribution and access just needs to be scoped to one client for a short window. <strong>CloudFront signed URLs/cookies</strong> do the equivalent at the CDN layer (needed when content is fronted by CloudFront) and are paired with an <strong>Origin Access Control</strong> that blocks any direct S3 URL access, forcing every request through CloudFront's signed-URL check.</li>
</ul>` },
        { id: "ns-reliability", label: "Design a Strategy to Meet Reliability Requirements",
          content: `<h3 id="multi-az-region-patterns">4.1 Multi-AZ / Multi-Region Architecture Patterns</h3><ul>
<li>Stateless compute tier behind an ALB spanning ≥2 AZs, ASG with <code>min</code> ≥ 2.</li>
<li>Stateful tier: Multi-AZ RDS/Aurora, ElastiCache with Multi-AZ replication group (Redis) or cluster mode.</li>
<li>Service quotas: know that <strong>default service quotas can block scaling</strong> during a real event (e.g., EC2 vCPU limits per Region) — request quota increases proactively (via Service Quotas console/API) for critical services ahead of expected peak.</li>
</ul><h3 id="loose-coupling-integration">4.2 Loose Coupling and Application Integration</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Service</th><th>Pattern</th></tr>
</thead>
<tbody>
<tr><td><strong>Amazon SQS</strong></td><td>Point-to-point buffering/decoupling; standard (at-least-once) or FIFO (exactly-once, ordered)</td></tr>
<tr><td><strong>Amazon SNS</strong></td><td>Pub/sub fan-out to multiple SQS queues/Lambdas/HTTP endpoints</td></tr>
<tr><td><strong>AWS Step Functions</strong></td><td>Orchestrate multi-step workflows with retries/error handling as first-class citizens</td></tr>
<tr><td><strong>Amazon EventBridge</strong></td><td>Event bus for decoupled, event-driven architectures, including SaaS/cross-account event sources</td></tr>
</tbody>
</table>
</div><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>SQS + ASG Scaling Pattern</strong>
<p>Scale the consumer ASG based on the <code>ApproximateNumberOfMessagesVisible</code> CloudWatch metric — this decouples the producer's burst rate from consumer capacity, a classic "handle unpredictable spiky load reliably" answer.</p>
</div>
</div><h3 id="ha-operations">4.3 High-Availability Operations</h3><ul>
<li><strong>Application-level health checks</strong> (ALB target group health check hitting a real app endpoint) catch more failure modes than <strong>EC2 status checks</strong> alone.</li>
<li>DNS-level failover (Route 53 health check + failover routing) for Region-level HA; database-level failover (RDS Multi-AZ, Aurora) for data-tier HA — the exam expects layered HA at every tier, not just compute.</li>
</ul>` },
        { id: "ns-performance", label: "Design a Solution to Meet Performance Objectives",
          content: `<h3 id="compute-selection">5.1 Compute Selection</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Family</th><th>Optimized for</th></tr>
</thead>
<tbody>
<tr><td><strong>General purpose (M, T)</strong></td><td>Balanced — web servers, small DBs</td></tr>
<tr><td><strong>Compute optimized (C)</strong></td><td>CPU-bound — batch processing, gaming servers, HPC</td></tr>
<tr><td><strong>Memory optimized (R, X, z1d)</strong></td><td>In-memory DBs, real-time big data analytics</td></tr>
<tr><td><strong>Storage optimized (I, D, H)</strong></td><td>High sequential I/O — NoSQL DBs, data warehousing</td></tr>
<tr><td><strong>Accelerated computing (P, G, Inf, Trn)</strong></td><td>ML training/inference, graphics</td></tr>
</tbody>
</table>
</div><h3 id="storage-selection">5.2 Storage Selection</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Service</th><th>Type</th><th>Use case</th></tr>
</thead>
<tbody>
<tr><td><strong>EBS gp3/io2</strong></td><td>Block, single-AZ, attach to one instance (Multi-Attach exception for io1/io2)</td><td>Boot volumes, DBs</td></tr>
<tr><td><strong>EBS st1/sc1 (HDD)</strong></td><td>Block, throughput- not IOPS-optimized, cannot be a boot volume</td><td>st1: big sequential workloads (big-data, log processing); sc1 ("Cold HDD"): lowest-cost option for large, infrequently accessed data such as a DMS target volume during migration</td></tr>
<tr><td><strong>Instance Store</strong></td><td>Ephemeral, highest IOPS</td><td>Temp/cache data, lost on stop</td></tr>
<tr><td><strong>EFS</strong></td><td>File, multi-AZ, shared across instances</td><td>Shared content, Linux workloads</td></tr>
<tr><td><strong>FSx for Windows/Lustre/NetApp/OpenZFS</strong></td><td>File, protocol/workload-specific</td><td>Windows shares, HPC, enterprise NAS migration</td></tr>
<tr><td><strong>S3</strong></td><td>Object</td><td>Static content, data lake, backups</td></tr>
</tbody>
</table>
</div><p><strong>AWS Storage Gateway File Gateway</strong> lets an on-prem media archive keep working with local-file semantics while a Lambda function (e.g., running <strong>Amazon Rekognition</strong> for face/image ML) processes the S3-backed objects — a <strong>Tape Gateway</strong> can't support this because its virtual tapes are Glacier-backed and not readable in real time. For block storage, <strong>Volume Gateway</strong> has two modes: <strong>Cached volumes</strong> keep only the most frequently accessed data on-prem (low local storage footprint, up to 32 TB per volume, up to 1,024 TB per gateway) with the full dataset durably stored in S3; <strong>Stored volumes</strong> keep the entire dataset on-prem for low-latency access to all data, asynchronously backed up to S3 as EBS snapshots.</p><h3 id="purpose-built-databases">5.3 Purpose-Built Databases</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Database</th><th>Model</th><th>Best for</th></tr>
</thead>
<tbody>
<tr><td><strong>RDS/Aurora</strong></td><td>Relational</td><td>Transactional, ACID, complex joins</td></tr>
<tr><td><strong>DynamoDB</strong></td><td>Key-value/document</td><td>Massive scale, single-digit ms latency, serverless</td></tr>
<tr><td><strong>ElastiCache (Redis/Memcached)</strong></td><td>In-memory cache</td><td>Sub-ms latency caching, session store, leaderboards</td></tr>
<tr><td><strong>DocumentDB</strong></td><td>Document (MongoDB-compatible)</td><td>JSON document workloads</td></tr>
<tr><td><strong>Neptune</strong></td><td>Graph</td><td>Highly connected data, fraud detection, social graphs</td></tr>
<tr><td><strong>Timestream</strong></td><td>Time-series</td><td>IoT/metrics data</td></tr>
<tr><td><strong>Keyspaces</strong></td><td>Wide-column (Cassandra-compatible)</td><td>Existing Cassandra workloads</td></tr>
<tr><td><strong>Redshift</strong></td><td>Data warehouse (columnar)</td><td>Analytics/BI, large-scale aggregation</td></tr>
<tr><td><strong>OpenSearch</strong></td><td>Search/log analytics</td><td>Full-text search, log analytics</td></tr>
</tbody>
</table>
</div><h3 id="caching-buffering-elasticity">5.4 Caching, Buffering, and Elasticity Patterns</h3><ul>
<li><strong>Caching</strong>: CloudFront (edge, static/dynamic content), ElastiCache (application/DB query cache), DAX (DynamoDB-specific microsecond cache).</li>
<li><strong>Buffering</strong>: SQS/Kinesis Data Streams absorb burst write rates so downstream systems process at their own sustainable pace — <strong>Kinesis Data Streams</strong> specifically is the answer whenever a scenario needs continuous, high-volume ingestion feeding a <strong>real-time</strong> dashboard/analytics pipeline, a latency profile SQS/S3/EMR/Redshift alone don't provide.</li>
<li><strong>Elasticity</strong>: Auto Scaling (target tracking &gt; step &gt; simple scaling policies, in that preference order for most cases), Aurora Serverless v2 for unpredictable DB load, Lambda/Fargate for workloads with no idle-capacity tolerance.</li>
<li><strong>Lambda reserved concurrency</strong> caps how many concurrent executions a specific function can use (and guarantees that capacity is available to it out of the account-wide pool) — set it to protect a downstream dependency (e.g., a database) from being overwhelmed by a burst of invocations, and monitor the <strong>Throttles</strong> CloudWatch metric to confirm the limit isn't being hit under normal load before tightening it further.</li>
</ul><h3 id="managed-ai-service-selection">5.5 Managed AI Service Selection</h3><p><strong>Amazon Connect</strong> (cloud contact center) + <strong>Amazon Lex</strong> (ASR + NLU chatbot) + <strong>Lambda</strong> (to query business systems and return data) is the standard "let callers self-serve without an agent" stack. Don't confuse it with <strong>Amazon Comprehend</strong> (text-insight extraction, no speech recognition) or <strong>Amazon Polly</strong> (text-to-speech only, no intent recognition) — neither can build the conversational bot itself.</p><h3 id="iot-edge-and-fleet-management">5.6 IoT Edge Inference and Fleet Management</h3><ul>
<li><strong>AWS IoT Greengrass</strong> extends AWS to edge devices/local servers, letting them run <strong>local ML inference</strong> using a model trained and optimized in <strong>Amazon SageMaker AI</strong> and deployed as a Greengrass component — the answer whenever a scenario needs near-real-time inference on-site (e.g., a factory floor) without a round trip to the cloud for every prediction, while still integrating with local system APIs via Greengrass components.</li>
<li><strong>AWS IoT Device Management</strong> (device registry, health/status monitoring, remote actions) paired with <strong>AWS IoT Core</strong> (the managed MQTT-based device gateway) is the standard fleet-monitoring stack for confirming large numbers of IoT devices stay connected and healthy — distinct from Greengrass, which runs compute/inference at the edge rather than managing device connectivity/inventory.</li>
</ul>` },
        { id: "ns-cost-optimization", label: "Determine a Cost Optimization Strategy for New Solutions",
          content: `<p>Builds on Domain 1 §5. New-solution-specific angle: pick the <strong>right pricing model at design time</strong> (e.g., default new fleets to Savings Plans commitment once usage is predictable; use Spot for stateless/fault-tolerant batch/CI workers from day one), model <strong>data transfer costs</strong> early (same-AZ traffic is free between resources with private IP, cross-AZ and cross-Region transfer both cost money — a frequent "why is this architecture expensive" root cause), and choose storage tiering (S3 Intelligent-Tiering when access patterns are unknown) instead of over-provisioning.</p><ul>
<li><strong>S3 event notifications</strong> (object created/removed/restored) triggering Lambda <strong>directly</strong> beat a scheduled EventBridge rule for near-real-time per-object processing — EventBridge's scheduled rules bottom out at a <strong>1-minute</strong> minimum interval, and routing through CloudTrail data events + EventBridge adds unnecessary steps when S3 can invoke Lambda natively.</li>
<li><strong>API Gateway caching</strong> (default TTL 300s, max 3600s, 0 = disabled) cuts Lambda invocations and cost directly at the API layer — cache at API Gateway, not by fronting it with a CloudFront distribution for that purpose.</li>
<li><strong>DynamoDB Auto Scaling</strong> (built on AWS Application Auto Scaling) adjusts provisioned R/W capacity to a target utilization automatically — cheaper and simpler than manual capacity planning. <strong>DynamoDB TTL</strong> deletes expired items automatically at no extra write-throughput cost, the default answer for "delete records after N days" over a scheduled Lambda cleanup job or an S3 lifecycle policy.</li>
</ul>` },
      ]},
      { id: "continuous-improvement", title: "03 · Continuous Improvement (25%)", color: "var(--c-purple)", items: [
        { id: "ci-operational-excellence", label: "Improve Overall Operational Excellence", type: "recommended",
          content: `<h3 id="monitoring-logging-strategy">1.1 Monitoring and Logging Strategy</h3><ul>
<li><strong>Amazon CloudWatch</strong>: metrics, logs, alarms, dashboards, and <strong>Logs Insights</strong> for ad hoc log querying. <strong>Composite alarms</strong> combine multiple alarms with AND/OR logic to reduce noise (e.g., only page if both latency AND error-rate alarms are in ALARM).</li>
<li><strong>CloudWatch anomaly detection</strong>: ML-based dynamic thresholds instead of static thresholds, useful when normal traffic has strong daily/weekly seasonality.</li>
<li><strong>AWS X-Ray</strong>: distributed tracing across microservices — the answer whenever the question is about pinpointing <em>which downstream service</em> in a call chain is causing latency/errors.</li>
<li><strong>Centralized logging</strong>: ship logs from all accounts/services to a central CloudWatch Logs account or an S3-based log lake queried via Athena, so operations has one place to look, not 20 accounts.</li>
<li>Prefer the <strong>unified CloudWatch agent</strong> over the legacy CloudWatch Logs agent, an SSM Agent workaround, or a custom Traffic-Mirroring-based daemon — it collects logs and metrics with one agent and needs the least custom engineering.</li>
<li>Native <strong>Service Quota monitoring</strong>: CloudWatch's <code>AWS/Usage</code> metric namespace plus a math expression like <code>metricId/SERVICE_QUOTA(metricId)*100</code> and an alarm threshold (e.g., 75%) is the low-effort, built-in way to get warned before hitting an account service limit (e.g., Fargate vCPUs) — building a custom dashboard/metric to compute the same percentage manually is unnecessary extra maintenance.</li>
</ul><pre><code>aws cloudwatch put-metric-alarm --alarm-name high-5xx-rate \\
  --metric-name HTTPCode_Target_5XX_Count --namespace AWS/ApplicationELB \\
  --statistic Sum --period 60 --threshold 10 --comparison-operator GreaterThanThreshold \\
  --evaluation-periods 3 --alarm-actions arn:aws:sns:us-east-1:111111111111:ops-alerts</code></pre><h3 id="alerting-automated-remediation">1.2 Alerting and Automated Remediation</h3><ul>
<li>Pattern: <strong>CloudWatch Alarm → EventBridge/SNS → Lambda (or Systems Manager Automation document)</strong> to auto-remediate known issues (restart a service, scale out, roll back a deployment) without waiting on a human.</li>
<li><strong>AWS Systems Manager Automation runbooks</strong>: pre-built and custom documents to perform standardized remediation (e.g., stop-and-start a stuck instance, rotate a credential) — reusable and auditable, preferred over one-off scripts.</li>
<li>To troubleshoot instances an Auto Scaling group keeps terminating as unhealthy, <strong>suspend the ASG's "Terminate" process</strong> and use Session Manager to log in — enabling EC2 <em>instance termination protection</em> alone is not enough, because the ASG can still terminate instances it created regardless of that setting.</li>
</ul><h3 id="improving-deployment-processes">1.3 Improving Deployment Processes</h3><ul>
<li>Review existing deployment pipelines for missing automated testing/rollback gates; add <strong>CodePipeline manual approval actions</strong> only where truly required (they're a bottleneck), and prefer automated CloudWatch-alarm-based rollback (see Domain 2 §1.2) over relying on a human to notice a bad deploy.</li>
<li><strong>AWS Config</strong> + <strong>Config Rules</strong> (including <strong>Conformance Packs</strong> for a bundled rule set) continuously evaluate resource configuration against desired state — a foundational tool for "detect configuration drift" answers.</li>
</ul><h3 id="failure-scenario-exercises">1.4 Failure-Scenario Exercises</h3><ul>
<li><strong>AWS Fault Injection Service (FIS)</strong> to run controlled game-days that intentionally break things (kill an AZ, add latency, throttle an API) to validate that automated recovery/runbooks actually work before a real incident forces the question.</li>
</ul><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Naming Correction: AWS Fault Injection Service</strong>
<p>The source material referred to this service as "AWS Fault Injection Simulator." AWS renamed the service to <strong>AWS Fault Injection Service</strong> (still abbreviated FIS); current AWS documentation ("What is AWS Fault Injection Service?") confirms this is the current official name. Corrected above and used consistently throughout this guide.</p>
</div>
</div>` },
        { id: "ci-security", label: "Improve Security", type: "recommended",
          content: `<h3 id="secrets-credential-management">2.1 Secrets and Credential Management</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Service</th><th>Best for</th></tr>
</thead>
<tbody>
<tr><td><strong>AWS Secrets Manager</strong></td><td>Secrets needing <strong>automatic rotation</strong> (DB credentials, API keys) with built-in Lambda rotation templates for RDS/Aurora/DocumentDB/Redshift</td></tr>
<tr><td><strong>Systems Manager Parameter Store</strong></td><td>General config + secrets (SecureString with KMS) without built-in rotation Lambda, lower cost, higher throughput for read-heavy config lookups</td></tr>
</tbody>
</table>
</div><p>For ECS, reference a Secrets Manager secret's ARN directly in the container definition's <code>secrets</code> block and grant access via the <strong>task execution role</strong> — never embed credentials in the image or task environment variables.</p><h3 id="least-privilege-auditing">2.2 Least-Privilege Auditing</h3><ul>
<li><strong>IAM Access Analyzer</strong> (policy generation feature): generates a least-privilege IAM policy based on actual CloudTrail access activity — the direct answer for "reduce over-permissioned roles based on what they actually use."</li>
<li><strong>IAM Access Advisor</strong>: shows last-accessed service/action data per role/user to find unused permissions to remove.</li>
<li><strong>AWS Config rule <code>iam-policy-no-statements-with-admin-access</code></strong> and similar managed rules to continuously flag overly broad policies.</li>
</ul><h3 id="vulnerability-detection-response">2.3 Vulnerability Detection and Response Prioritization</h3><ul>
<li><strong>Amazon Inspector</strong>: continuous, automated vulnerability scanning (CVEs, network reachability) for EC2, ECR container images, and Lambda functions — replaces point-in-time manual scans.</li>
<li><strong>Amazon GuardDuty + Security Hub + EventBridge</strong>: automatically prioritize and route findings by severity, trigger the right automated response (e.g., isolate an EC2 instance's security group on a <code>CryptoCurrency:EC2/BitcoinTool.B</code> finding) via Lambda.</li>
<li><strong>Amazon Detective</strong>: after a GuardDuty finding, use Detective to visualize the resource's interaction history and find root cause faster than manually correlating CloudTrail/VPC Flow Logs.</li>
<li>Put <strong>AWS WAF</strong> in front of whichever component actually receives public traffic (e.g., API Gateway) — not directly on Lambda, which WAF can't protect at all. Use <strong>AWS Config</strong> (not AWS Firewall Manager) to track WAF web ACL rule changes within a single account; Firewall Manager is for centrally managing WAF/Shield/Security Groups <em>across an Organization</em>.</li>
<li>To block a known malicious IP/CIDR block, use a <strong>Network ACL</strong> deny rule (Security Groups are allow-only and cannot explicitly deny) combined with <strong>AWS Shield Advanced</strong> for broader DDoS protection — Shield Standard is free/automatic L3-4 protection for everyone, Advanced adds DRT support and cost protection during an attack.</li>
<li>Mitigating a Layer-7 DDoS/flash-crowd needs <strong>CloudFront</strong> (rejects malformed connections like SYN floods/UDP reflection before they reach origin) + an <strong>ALB with Auto Scaling</strong> backend (spreads and absorbs load) + <strong>WAF</strong> — more ENIs/enhanced networking or bigger Reserved Instances don't help because application-layer floods still saturate CPU, not just network bandwidth.</li>
</ul><h3 id="patch-backup-review">2.4 Patch and Backup Practice Review</h3><p>Reuse Systems Manager Patch Manager (Domain 2 §3.4) and AWS Backup (Domain 1 §3.3); the "improvement" angle here is auditing <strong>compliance</strong> (Patch Manager compliance reports, AWS Backup Audit Manager / Backup compliance reports) and closing gaps found, not initial setup. For custom AMIs specifically: <strong>Amazon Inspector</strong> runs the actual CVE assessment (the SSM agent alone cannot do CVE scanning), and a scheduled <strong>SSM Automation</strong> document (e.g., the <code>AWS-UpdateLinuxAmi</code>/<code>AWS-UpdateWindowsAmi</code> runbooks) invoked on a periodic EventBridge cron rule re-patches and re-bakes security-approved AMIs — track the approved-AMI list in <strong>SSM Parameter Store</strong> so downstream pipelines always launch from the latest compliant image.</p>` },
        { id: "ci-performance", label: "Improve Performance",
          content: `<h3 id="high-performing-architectures">3.1 High-Performing Architectures</h3><ul>
<li><strong>Auto Scaling refinements</strong>: move from simple/step scaling to <strong>target tracking</strong> policies (simplest to tune, e.g., target 50% average CPU) or <strong>predictive scaling</strong> (ML forecast of known cyclical patterns, scales ahead of the load instead of reactively).</li>
<li><strong>Placement groups</strong>: <strong>Cluster</strong> (low-latency, same rack, HPC/tightly-coupled compute), <strong>Spread</strong> (each instance on distinct hardware, max fault isolation for a small number of critical instances), <strong>Partition</strong> (groups of instances isolated from each other, for large distributed systems like HDFS/Cassandra needing rack-awareness).</li>
<li>A tightly-coupled HPC cluster that degrades as node count grows is usually bottlenecked on shared storage and cross-AZ network hops, not raw compute: keep every node in a single AZ inside a <strong>Cluster placement group</strong>, add an <strong>Elastic Fabric Adapter (EFA)</strong> network interface for OS-bypass, low-latency inter-node communication (MPI-style workloads), and replace a shared <strong>EFS</strong> mount (which becomes the bottleneck once hundreds of instances hit it concurrently) with <strong>Amazon FSx for Lustre</strong>, purpose-built for multiple GB/s throughput and hundreds of thousands of IOPS.</li>
<li><strong>Instance fleets</strong>: EC2 Fleet / Spot Fleet mixing instance types/purchase options to maintain target capacity cost-effectively even if some Spot capacity is reclaimed. To absorb a temporary peak on top of steady-state capacity, add a <strong>Spot Fleet with a diversified allocation strategy across multiple AZs/subnets</strong> under its own Auto Scaling — Reserved or On-Demand instances cost more for a short-lived peak.</li>
<li><strong>AWS Batch with Managed Compute Environments on Spot</strong> is the go-to for large parallel batch/image processing jobs — it beats a self-managed EMR/Spark cluster (constant EC2 cost + cluster management overhead) and an SQS+ASG+EFS design (EFS costs more than S3 for raw data, and a plain job list in SQS can let Spot interruptions double-process a job).</li>
<li>For a repetitive/duplicate read-heavy database query pattern, add an <strong>ElastiCache</strong> layer in front of the database — adding more RDS read replicas alone doesn't reduce duplicate/redundant query volume.</li>
</ul><h3 id="global-performance-improvements">3.2 Global Performance Improvements</h3><ul>
<li><strong>Amazon CloudFront</strong>: caches static/dynamic content at edge locations across CloudFront's global network; use <strong>Origin Shield</strong> to reduce origin load from regional cache misses.</li>
<li><strong>AWS Global Accelerator</strong>: improves performance for <strong>non-cacheable, TCP/UDP</strong> traffic (gaming, VoIP, non-HTTP APIs) by routing over the AWS global network backbone to the nearest healthy endpoint — different use case from CloudFront (HTTP/HTTPS content caching).</li>
<li><strong>Edge computing</strong>: Lambda@Edge / CloudFront Functions to run logic at the edge (header manipulation, auth checks, A/B testing) without a round trip to origin.</li>
<li>A dropping CloudFront <strong>cache hit ratio</strong> caused by query-string parameters that differ only in case or ordering (CloudFront caches a distinct object per exact query string) is fixed with a <strong>Lambda@Edge</strong> function on the <strong>viewer request</strong> trigger that alphabetizes parameter names and lowercases values <em>before</em> CloudFront checks its cache — there is no built-in "case-insensitive" query-string option, and disabling query-string-based caching entirely would serve the wrong cached object to requests that actually need distinct responses.</li>
</ul><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>context7 fact-check note</strong>
<p>The source material cited "400+ edge locations" for CloudFront. AWS's edge location/point-of-presence count is a marketing figure that changes frequently and current AWS documentation available via context7 did not surface a precise, stable count worth committing to print. The specific number was dropped above rather than repeating a figure that may already be stale — the architectural guidance (edge caching, Origin Shield) is unaffected.</p>
</div>
</div><h3 id="measuring-slas-kpis">3.3 Measuring Against SLAs/KPIs</h3><p>Translate business SLAs into concrete, measurable CloudWatch metrics/alarms (e.g., "99.9% of requests under 200ms" → p99 latency CloudWatch alarm + dashboard), not just infrastructure-level metrics that don't map to the actual business requirement.</p><h3 id="identifying-bottlenecks">3.4 Identifying Bottlenecks</h3><p>Use <strong>CloudWatch Logs Insights</strong>, <strong>X-Ray Service Map</strong>, <strong>RDS Performance Insights</strong> (top SQL by wait time/load) to find the actual bottleneck instead of guessing — a recurring exam pattern is "which single tool identifies a slow SQL query" → RDS/Aurora Performance Insights.</p>` },
        { id: "ci-reliability", label: "Improve Reliability",
          content: `<h3 id="evaluating-reliability-gaps">4.1 Evaluating Existing Architecture for Reliability Gaps</h3><ul>
<li>Look for <strong>single points of failure</strong>: single-AZ resources (a lone EC2 instance, single-AZ RDS, a NAT instance instead of NAT Gateway), hardcoded IPs instead of DNS, tightly-coupled synchronous calls with no retry/backoff.</li>
<li><strong>AWS Resilience Hub</strong>: assesses an application against a defined resiliency policy (RTO/RPO targets) and produces specific, actionable recommendations — the direct exam answer for "systematically identify reliability gaps against a target RTO/RPO."</li>
<li>An intermittent (e.g., ~50%) outbound-connectivity failure rate across two AZs, with NACLs otherwise fine, is the classic signature of a <strong>failed NAT instance in one AZ</strong> (AWS doesn't auto-recover NAT instances) — a strong signal to replace remaining NAT instances with NAT Gateways.</li>
<li>Long-running connections (e.g., a slow database patch download) that repeatedly fail to complete behind a <strong>NAT instance</strong> is the other classic NAT-instance signature: on a connection timeout, a NAT instance sends a <strong>FIN packet</strong> that tears the connection down outright, while a <strong>NAT Gateway</strong> instead sends an <strong>RST</strong> only to whichever side tries to keep using the stale connection — practically more forgiving for long transfers. This is a durability/design difference, not something a Cluster/Spread placement group affects.</li>
<li>If one Availability Zone's healthy instances are getting <strong>zero traffic</strong> from an Application Load Balancer while other AZs work fine, check whether that AZ's subnet is actually <strong>enabled/associated with the ALB</strong> (ALB subnet mappings, one per AZ) before suspecting target-group health checks, security groups, or the instances themselves — a missing AZ association is the most common root cause of this exact symptom.</li>
<li>An S3 static website that suddenly stops serving content is almost always a <strong>missing public read access</strong> on the bucket, or a bucket name that doesn't <strong>exactly match</strong> the DNS record name — not a missing <code>error.html</code>, a missing filename in the URL, or slow Route 53 propagation (Route 53 typically propagates within ~60 seconds).</li>
</ul><h3 id="remediating-spof">4.2 Remediating Single Points of Failure</h3><ul>
<li>Convert single-AZ to Multi-AZ (RDS Multi-AZ, ASG spanning AZs), NAT instance → NAT Gateway (managed, HA within an AZ; deploy one per AZ for AZ-level redundancy), replace hardcoded endpoints with Route 53 records / Service Discovery.</li>
<li>Implement <strong>retries with exponential backoff and jitter</strong> in application code/SDKs (default AWS SDK behavior, but must not be disabled) and <strong>circuit breakers</strong> to prevent cascading failure when a downstream dependency degrades.</li>
<li>If messages are landing in a <strong>dead-letter queue</strong> before genuinely slow-but-successful processing can finish, raise the SQS <strong>redrive policy's <code>maxReceiveCount</code></strong> — increasing the visibility timeout or delivery delay doesn't fix messages that already failed and were re-queued too aggressively.</li>
<li>If an ALB target-group health check hits a page that queries the database, it multiplies DB load with every health-check interval across every instance — switch the <strong>target-group health check to a lightweight static page</strong> and add a separate <strong>Route 53 health check</strong> against a real DB-backed page for genuine end-to-end verification. ALB target-group health checks only support <strong>HTTP/HTTPS</strong>, never a raw TCP check.</li>
</ul><h3 id="data-replication-self-healing">4.3 Data Replication, Self-Healing, and Elasticity</h3><p>Reuse Domain 2 §4 mechanisms (Multi-AZ, read replicas, ASG health-check replacement) — the "improvement" framing here means retrofitting them onto an existing architecture that lacks them, prioritized by business impact and quota/service limits that might block scale-out during remediation.</p>` },
        { id: "ci-cost-optimization", label: "Identify Opportunities for Cost Optimization",
          content: `<h3 id="usage-analysis">5.1 Usage Analysis</h3><ul>
<li><strong>Cost Explorer "Rightsizing Recommendations"</strong> and <strong>AWS Compute Optimizer</strong> to find over-provisioned EC2/EBS/Lambda; <strong>Trusted Advisor cost checks</strong> to find idle load balancers, unattached EBS volumes, idle RDS instances.</li>
<li><strong>AWS Cost and Usage Report (CUR) via Athena/QuickSight</strong> for granular, custom "which team/service is driving this cost" investigation beyond what Cost Explorer's UI supports.</li>
</ul><h3 id="identifying-unused-resources">5.2 Identifying Unused Resources</h3><p>Trusted Advisor + Compute Optimizer flag idle resources; combine with <strong>AWS Config</strong> rules (e.g., unattached EBS volume, unused Elastic IP) for continuous (not point-in-time) detection, and automate cleanup via Lambda/Systems Manager Automation on a schedule.</p><h3 id="billing-alarms-reporting">5.3 Billing Alarms and Reporting</h3><pre><code>aws budgets create-budget --account-id 111111111111 --budget file://budget.json \\
  --notifications-with-subscribers file://notifications.json</code></pre><ul>
<li><strong>AWS Budgets</strong> alarms based on expected usage patterns (not just a flat dollar amount — budgets can alert on % variance from forecast).</li>
<li>Tagging (Domain 1 §5.3) enables cost allocation reporting per team/project in CUR/Cost Explorer — a prerequisite most "identify which team is overspending" scenarios assume is already in place, or call out as the first remediation step if missing.</li>
</ul>` },
      ]},
      { id: "migration-modernization", title: "04 · Migration and Modernization (20%)", color: "var(--c-lime)", items: [
        { id: "mm-workload-selection", label: "Select Existing Workloads and Processes for Potential Migration", type: "recommended",
          content: `<h3 id="migration-assessment-tracking">1.1 Migration Assessment and Tracking</h3><ul>
<li><strong>AWS Migration Hub</strong>: single place to track migration progress across multiple AWS and partner migration tools, and to view/import a discovered application portfolio.</li>
<li><strong>AWS Application Discovery Service</strong>: agentless (via VMware vCenter) or agent-based discovery of on-prem server inventory, performance data, and process/network dependency mapping — the required first step before you can build a valid migration wave plan.</li>
<li><strong>AWS Migration Evaluator</strong> (formerly TSO Logic): builds a data-driven business case (current-state cost vs. projected AWS cost) from discovery data.</li>
</ul><h3 id="seven-rs-portfolio-assessment">1.2 Portfolio Assessment and the 7 Rs</h3><div class="table-wrap">
<table>
<thead>
<tr><th>R</th><th>Meaning</th><th>When to use</th></tr>
</thead>
<tbody>
<tr><td><strong>Retire</strong></td><td>Decommission</td><td>App no longer needed</td></tr>
<tr><td><strong>Retain</strong></td><td>Keep as-is (for now)</td><td>Not ready, revisit later, or too costly to migrate now</td></tr>
<tr><td><strong>Rehost</strong> (“lift and shift”)</td><td>Move as-is, no code change</td><td>Fast migration, minimal risk — e.g., via AWS Application Migration Service</td></tr>
<tr><td><strong>Relocate</strong></td><td>Move to AWS without changes, for VMware/hypervisor-level workloads</td><td>e.g., VMware Cloud on AWS</td></tr>
<tr><td><strong>Replatform</strong> (“lift, tinker, and shift”)</td><td>Some optimization, no core architecture change</td><td>e.g., move DB to RDS, keep app logic the same</td></tr>
<tr><td><strong>Repurchase</strong> (“drop and shop”)</td><td>Replace with a SaaS/different product</td><td>Move to a COTS/SaaS replacement</td></tr>
<tr><td><strong>Refactor / Re-architect</strong></td><td>Redesign using cloud-native services</td><td>Long-term strategic apps needing new features/scale not possible on the current architecture</td></tr>
</tbody>
</table>
</div><p>Simply mirroring an on-prem setup into equivalent EC2 instances (<strong>Rehost</strong>) doesn't gain any of the cloud's elasticity/managed-service benefits — when a question's correct answer swaps a self-managed DB for a managed one (e.g., Dockerized app + MySQL → <strong>ECS + RDS via DMS</strong>) without a full application rewrite, that's <strong>Replatform</strong> ("lift, tinker, and shift"), not Rehost or Refactor.</p><h3 id="wave-planning-tco">1.3 Wave Planning and TCO</h3><ul>
<li>Group applications into <strong>migration waves</strong> based on dependencies (discovered via Application Discovery Service), business priority, complexity, and risk — typically start with low-complexity, low-risk, high-confidence wins to build momentum, and sequence dependent applications together.</li>
<li><strong>Total Cost of Ownership (TCO)</strong> comparison (via AWS Migration Evaluator or AWS Pricing Calculator) justifies the migration business case and informs which target architecture (rehost vs. replatform) delivers the best ROI for a given app.</li>
</ul>` },
        { id: "mm-migration-approach", label: "Determine the Optimal Migration Approach for Existing Workloads", type: "recommended",
          content: `<h3 id="data-migration">2.1 Data Migration</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Tool</th><th>Use case</th></tr>
</thead>
<tbody>
<tr><td><strong>AWS DataSync</strong></td><td>Online, automated transfer of large datasets (NFS/SMB/object storage) to/from S3, EFS, FSx, with scheduling and validation</td></tr>
<tr><td><strong>AWS Transfer Family</strong></td><td>Managed SFTP/FTPS/FTP endpoints backed by S3/EFS, for partners/legacy workflows expecting those protocols</td></tr>
<tr><td><strong>AWS Snow Family</strong> (Snowcone, Snowball)</td><td>Offline, physical transfer for very large datasets or limited/no network connectivity</td></tr>
<tr><td><strong>Amazon S3 Transfer Acceleration</strong></td><td>Speeds up uploads over long distances via CloudFront edge locations</td></tr>
</tbody>
</table>
</div><p>Decision driver: <strong>available bandwidth and data volume</strong>. Rule of thumb the exam expects — if transferring over the network would take <strong>weeks</strong>, use the Snow Family; if there's a decent pipe and it's an ongoing/scheduled sync, use DataSync. For a very large (tens-of-TB+), bandwidth-constrained, time-boxed data warehouse migration, the <strong>AWS Data Transfer Terminal</strong> (a physical walk-in facility to upload local storage devices straight into S3) is a newer offline-transfer option alongside the Snow Family — same decision driver: if the available network pipe can't move the data set within the window, go physical/offline.</p><pre><code>aws datasync create-task --source-location-arn arn:aws:datasync:...:location/loc-0nfs \\
  --destination-location-arn arn:aws:datasync:...:location/loc-0s3 \\
  --schedule ScheduleExpression="cron(0 2 * * ? *)"</code></pre><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Correction: AWS Snowmobile Retired</strong>
<p>The source material listed the Snow Family as “Snowcone/Snowball/Snowmobile.” Current AWS documentation and reporting confirm AWS retired the Snowmobile truck-based transfer service in April 2024 — it is no longer offered for order. The table above lists only the currently available devices (Snowcone, Snowball). For a scenario needing to move an exabyte-scale dataset that once would have pointed to Snowmobile, the current AWS-recommended path is multiple parallel Snowball Edge devices or a dedicated AWS Direct Connect link, not a truck.</p>
</div>
</div><h3 id="application-migration">2.2 Application Migration</h3><ul>
<li><strong>AWS Application Migration Service (MGN)</strong>: agent-based, continuous block-level replication of on-prem/other-cloud servers to AWS with minimal-downtime cutover — the current standard rehost tool (successor to CloudEndure Migration; shares underlying technology with AWS Elastic Disaster Recovery). It replicates all attached/supported volumes together (no need to split root-volume from data-volume migration into separate tools) and supports <strong>test launches</strong> before a final <strong>cutover launch</strong>.</li>
<li><strong>AWS Server Migration Service (SMS)</strong>: legacy, being phased out in favor of MGN for most new rehost projects — know it exists for the exam, but MGN is the primary current answer. <strong>VM Import/Export</strong> has no ongoing sync — every re-import is a full one-shot operation, making it a poor fit for "keep replicating changes until cutover" requirements compared to MGN.</li>
<li><strong>Amazon ECS Anywhere</strong> lets on-premises compute, EC2, and Fargate coexist in a <strong>single ECS cluster</strong>, making it a good "start containers on-prem, migrate to the cloud later" path — <strong>EKS Anywhere</strong> is scoped to on-prem/VMware-managed infrastructure only and does not integrate with AWS-managed EKS or Fargate.</li>
</ul><h3 id="database-migration">2.3 Database Migration</h3><ul>
<li><strong>AWS Database Migration Service (DMS)</strong>: homogeneous (MySQL→MySQL) or heterogeneous (Oracle→Aurora PostgreSQL) migration, supports <strong>continuous data replication (CDC)</strong> for minimal-downtime cutover.</li>
<li><strong>AWS Schema Conversion Tool (SCT)</strong>: converts source schema/stored procedures/code to the target engine's dialect for <strong>heterogeneous</strong> migrations — required before DMS can move data when engines differ significantly. Not needed for homogeneous migrations. <strong>AWS Glue</strong> (ETL/analytics) and <strong>AWS SAM</strong> (serverless framework) are not schema-conversion tools and are the wrong choice whenever a question dresses them up as one.</li>
<li><strong>Oracle Real Application Clusters (RAC)</strong> is not supported by Amazon RDS at all — a RAC workload being lifted to AWS must run on <strong>self-managed EC2</strong> instead, with backups handled via <strong>Amazon Data Lifecycle Manager (DLM)</strong> scheduled EBS snapshot policies (tag-based) rather than a hand-rolled cron/shell-script snapshot job, which DLM replaces along with its own retention/cleanup of outdated snapshots.</li>
</ul><pre><code>aws dms create-replication-task --replication-task-identifier ora-to-aurora \\
  --source-endpoint-arn arn:aws:dms:...:endpoint:src-oracle \\
  --target-endpoint-arn arn:aws:dms:...:endpoint:tgt-aurora \\
  --migration-type full-load-and-cdc --table-mappings file://mappings.json</code></pre><h3 id="networking-identity-governance">2.4 Networking, Identity, and Governance for Migration</h3><ul>
<li>Extend the on-prem network to AWS via Direct Connect/VPN (Domain 1 §1.2) before migrating so hybrid dependencies keep working during transition.</li>
<li><strong>AWS Directory Service</strong> (AWS Managed Microsoft AD, or a trust relationship to on-prem AD) so migrated Windows workloads keep existing AD-based auth without a parallel identity system; <strong>IAM Identity Center</strong> for centralized human access to the new AWS environment.</li>
<li>Apply <strong>AWS Control Tower / Organizations</strong> governance (Domain 1 §4.1) to the landing zone <em>before</em> migrating workloads into it, not after.</li>
</ul>` },
        { id: "mm-new-architecture", label: "Determine a New Architecture for Existing Workloads",
          content: `<h3 id="compute-platform-selection">3.1 Compute Platform Selection</h3><p>Choose based on how much re-architecture the workload can tolerate: <strong>EC2</strong> (rehost, most control), <strong>Elastic Beanstalk</strong> (replatform, managed PaaS with less ops overhead but still EC2-based), containers (repurpose existing container workloads), <strong>Lambda</strong> (only for refactored, event-driven/stateless workloads — not a direct rehost target).</p><h3 id="container-hosting-platform-selection">3.2 Container Hosting Platform Selection</h3><div class="table-wrap">
<table>
<thead>
<tr><th>Option</th><th>Control plane</th><th>Data plane</th><th>Use case</th></tr>
</thead>
<tbody>
<tr><td><strong>ECS on EC2</strong></td><td>AWS-managed</td><td>Self-managed EC2 capacity</td><td>Cost control, existing EC2 reservations, simpler AWS-native orchestration</td></tr>
<tr><td><strong>ECS on Fargate</strong></td><td>AWS-managed</td><td>AWS-managed (serverless)</td><td>No infrastructure management, pay per task</td></tr>
<tr><td><strong>EKS on EC2</strong></td><td>AWS-managed control plane</td><td>Self-managed EC2 capacity</td><td>Existing Kubernetes tooling/expertise, need node-level control</td></tr>
<tr><td><strong>EKS on Fargate</strong></td><td>AWS-managed</td><td>AWS-managed (serverless)</td><td>Kubernetes API compatibility with no node management</td></tr>
<tr><td><strong>Amazon ECR</strong></td><td>—</td><td>—</td><td>Private container registry for all of the above</td></tr>
</tbody>
</table>
</div><p><strong>Exam signal</strong>: “team already has significant Kubernetes investment/tooling” → EKS; “team wants AWS-native simplicity, no existing K8s requirement” → ECS; “no infrastructure management at all” → Fargate (either orchestrator). Note <strong>Fargate is not available on AWS Outposts</strong> at all — ECS/EKS on Outposts needs EC2 capacity.</p><h3 id="storage-service-selection">3.3 Storage Service Selection for Migrated Workloads</h3><p>Reapply the Domain 2 §5.2 selection criteria to the migration context: e.g., an on-prem NFS file share typically maps to <strong>EFS</strong>; an on-prem Windows file share maps to <strong>FSx for Windows File Server</strong>; on-prem SAN/iSCSI block storage maps to <strong>EBS</strong> (per-instance) or <strong>FSx</strong>; <strong>AWS Storage Gateway</strong> (File, Volume, or Tape Gateway) provides a hybrid bridge that lets an on-prem application keep using local-like storage while data is actually tiered to S3/EBS/Glacier during a phased migration.</p><h3 id="database-platform-selection">3.4 Database Platform Selection for Migrated Workloads</h3><p>Reapply the Domain 2 §5.3 purpose-built database table; the migration-specific nuance is <strong>self-managed databases on EC2</strong> as an interim/rehost option when the source engine/version isn't supported by a managed service yet, with a plan to move to RDS/Aurora once supportable — call this out explicitly when a question describes an unsupported legacy engine version.</p>` },
        { id: "mm-modernization", label: "Determine Opportunities for Modernization and Enhancements",
          content: `<h3 id="serverless-decoupling">4.1 Serverless and Decoupling Opportunities</h3><ul>
<li><strong>AWS Lambda</strong> for event-driven, short-duration, bursty-traffic components — the top modernization target after a rehost/replatform, once traffic patterns and integration points are well understood in the AWS environment.</li>
<li>Identify components to <strong>decouple</strong> (see Domain 2 §4.2 loose-coupling patterns) that were tightly coupled on-prem simply because synchronous calls were the only option available in the old environment — post-migration is the natural point to introduce SQS/SNS/EventBridge between them.</li>
</ul><h3 id="container-modernization">4.2 Container Modernization</h3><p>Migrate a monolith-in-a-VM to containers on ECS/EKS/Fargate as an intermediate modernization step before further decomposition into microservices, when a full serverless rewrite isn't yet justified.</p><h3 id="purpose-built-database-adoption">4.3 Purpose-Built Database Adoption</h3><p>Post-migration, revisit whether the “safe” choice made during migration (e.g., lift-and-shift to RDS for everything) should be selectively replaced: high-scale key-value access patterns → DynamoDB; unpredictable relational load → Aurora Serverless v2; hot cache-friendly reads → ElastiCache — using the Domain 2 §5.3 table as the decision framework. <strong>DynamoDB Global Tables</strong> (multi-Region, multi-active, automatic conflict resolution) is the correct choice whenever a scenario explicitly calls for a NoSQL, globally-distributed, low-latency read/write database — a hand-rolled Lambda-based cross-region replay doesn't scale to millions of users, and S3-backed backup/restore replication is far too slow to be "real-time."</p><h3 id="application-integration-modernization">4.4 Application Integration Modernization</h3><p>Replace custom polling/batch integration code inherited from the on-prem design with <strong>SQS/SNS/EventBridge/Step Functions</strong>, matching the pattern to the need: point-to-point buffering → SQS; fan-out → SNS; complex multi-step orchestration with retries/compensation → Step Functions; SaaS/partner event ingestion → EventBridge.</p>` },
      ]},
    ],
};
