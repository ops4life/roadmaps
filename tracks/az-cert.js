const TRACK_AZ_CERT = {
    id: "az-cert", code: "AZ-CERT", title: "AZ-104",
    tagline: "AZ-104 — Azure Administrator Associate.",
    blurb: "Your day-to-day Azure toolkit, exam-ready — identity, storage, compute, networking, and monitoring, covering everything an Azure admin actually touches.",
    storageKey: "ops4life:az-cert", accent: "var(--c-teal)",
    sections: [
      { id: "identities-governance", title: "01 · Identities and Governance (20-25%)", color: "var(--c-teal)", items: [
        { id: "ig-entra-users-groups", label: "Microsoft Entra ID Users and Groups", type: "recommended",
          content: `<h3 id="create-users-groups">1.1 Create Users and Groups</h3><h4>User Types</h4><ul>
<li><strong>Cloud Identity</strong>: users created directly in Microsoft Entra ID</li>
<li><strong>Directory-Synchronized Identity</strong>: users synced from on-premises AD (via Microsoft Entra Connect)</li>
<li><strong>Guest User (B2B)</strong>: external users invited to collaborate</li>
</ul><h4>Creating Users</h4><pre><code># PowerShell
New-AzADUser -DisplayName "John Doe" -UserPrincipalName "john.doe@contoso.com" -Password $password -MailNickname "johndoe"</code></pre><pre><code># Azure CLI
az ad user create --display-name "John Doe" --password &lt;password&gt; --user-principal-name john.doe@contoso.com</code></pre><h4>Creating Groups</h4><ul>
<li><strong>Security Groups</strong>: used for resource access management</li>
<li><strong>Microsoft 365 Groups</strong>: used for collaboration (email, calendar, files)</li>
</ul><p><strong>Assignment Types</strong>:</p><ul>
<li><strong>Assigned</strong>: manually add members</li>
<li><strong>Dynamic User</strong>: automatically add users based on rules</li>
<li><strong>Dynamic Device</strong>: automatically add devices based on rules</li>
</ul><pre><code># Create a security group
az ad group create --display-name "IT Admins" --mail-nickname "itadmins"

# Create dynamic group with membership rule
az ad group create --display-name "Marketing Users" --mail-nickname "marketing" --membership-rule "user.department -eq 'Marketing'"</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>Dynamic membership rules (both <strong>Dynamic User</strong> and <strong>Dynamic Device</strong> groups) require a <strong>Microsoft Entra ID P1</strong> license — a common trap when a scenario says "automatically add users" but the tenant is on the free tier.</p>
</div>
</div><h3 id="manage-user-group-properties">1.2 Manage User and Group Properties</h3><h4>User Properties</h4><ul>
<li>Display name, user principal name (UPN)</li>
<li>Job title, department, manager</li>
<li>Contact information</li>
<li>Usage location (required for license assignment)</li>
</ul><h4>Managing Licenses</h4><ul>
<li>Assign licenses directly to users or groups</li>
<li>Group-based licensing automatically assigns licenses to group members</li>
</ul><pre><code># Assign license to user (current: Microsoft Entra PowerShell)
Connect-Entra -Scopes 'User.ReadWrite.All'
Set-EntraUserLicense -UserId &lt;user-id&gt; -AssignedLicenses &lt;license-object&gt;</code></pre><div class="callout warn">
<span class="callout-icon">⚠️</span>
<div class="callout-body">
<strong>Correction: Deprecated Cmdlet</strong>
<p>The legacy <strong>AzureAD PowerShell module</strong> (and its <code>Set-AzureADUserLicense</code> cmdlet) has been retired by Microsoft. The current equivalent is <code>Set-EntraUserLicense</code> from the <strong>Microsoft Entra PowerShell</strong> module (or <code>Update-MgUserLicense</code> via Microsoft Graph PowerShell). Know the <em>concept</em> for the exam — group-based vs. direct license assignment — the exact cmdlet name is less likely to be tested than the underlying behavior.</p>
</div>
</div><h3 id="manage-external-users">1.3 Manage External Users</h3><h4>Microsoft Entra B2B Collaboration</h4><ul>
<li>Invite external users as guests</li>
<li>External users authenticate with their home organization</li>
<li>Control guest access with external collaboration settings</li>
</ul><pre><code># Invite guest user
az ad user create --display-name "External User" --user-principal-name externaluser@partner.com --user-type Guest</code></pre><h4>External Identities Settings</h4><ul>
<li>Configure who can invite guests (admins, users, guests)</li>
<li>Collaboration restrictions (allowed/blocked domains)</li>
<li>Guest user permissions (restricted or same as members)</li>
</ul><h3 id="configure-sspr">1.4 Configure Self-Service Password Reset (SSPR)</h3><h4>Requirements</h4><ul>
<li><strong>Microsoft Entra ID P1 or P2</strong> license required for <strong>on-premises password writeback</strong> (SSPR itself is available on lower tiers, but writeback to on-prem AD needs P1/P2 or Microsoft 365 Business Premium)</li>
<li>Configure authentication methods — admins choose whether <strong>one or two</strong> methods are required to reset/unlock</li>
</ul><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Correction: Required Method Count Is Configurable</strong>
<p>Some source material states SSPR requires "2 methods" as a fixed rule. That's not accurate — the number of authentication methods a user must register to reset/unlock (one or two) is an <strong>admin-configurable setting</strong>, not a hardcoded platform requirement.</p>
</div>
</div><h4>Authentication Methods</h4><ul>
<li>Mobile app notification</li>
<li>Mobile app code</li>
<li>Email</li>
<li>Mobile phone (SMS)</li>
<li>Office phone</li>
<li>Security questions</li>
</ul><h4>Configuration Steps</h4><ol>
<li>Enable SSPR for selected or all users</li>
<li>Configure authentication methods</li>
<li>Set registration requirements</li>
<li>Configure password writeback (for hybrid)</li>
<li>Customize notifications</li>
</ol><pre><code># Users register at: https://aka.ms/ssprsetup
# Users reset password at: https://aka.ms/sspr</code></pre>` },
        { id: "ig-manage-access", label: "Manage Access to Azure Resources", type: "recommended",
          content: `<h3 id="built-in-azure-roles">2.1 Built-in Azure Roles</h3><h4>Key Built-in Roles</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Role</th><th>Description</th><th>Scope</th></tr>
</thead>
<tbody>
<tr><td><strong>Owner</strong></td><td>Full access including the right to delegate access</td><td>All resources</td></tr>
<tr><td><strong>Contributor</strong></td><td>Full access to resources but cannot grant access</td><td>All resources</td></tr>
<tr><td><strong>Reader</strong></td><td>View all resources but cannot make changes</td><td>All resources</td></tr>
<tr><td><strong>User Access Administrator</strong></td><td>Manage user access to Azure resources</td><td>All resources</td></tr>
</tbody>
</table>
</div><h4>Resource-Specific Roles</h4><ul>
<li><strong>Virtual Machine Contributor</strong>: manage VMs but not their network/storage</li>
<li><strong>Network Contributor</strong>: manage networks</li>
<li><strong>Storage Account Contributor</strong>: manage storage accounts</li>
<li><strong>SQL DB Contributor</strong>: manage SQL databases</li>
<li><strong>Website Contributor</strong>: manage websites</li>
</ul><h3 id="assign-roles-scopes">2.2 Assign Roles at Different Scopes</h3><h4>RBAC Scope Hierarchy</h4><ol>
<li><strong>Management Group</strong>: highest level, applies to multiple subscriptions</li>
<li><strong>Subscription</strong>: applies to all resource groups and resources</li>
<li><strong>Resource Group</strong>: applies to all resources in the group</li>
<li><strong>Resource</strong>: applies to a specific resource only</li>
</ol><p><strong>Inheritance</strong>: permissions assigned at a parent scope are inherited by child scopes.</p><pre><code># Assign role at subscription scope
az role assignment create --assignee user@contoso.com --role "Contributor" --scope /subscriptions/&lt;subscription-id&gt;

# Assign role at resource group scope
az role assignment create --assignee user@contoso.com --role "Virtual Machine Contributor" --resource-group myResourceGroup

# Assign role at resource scope
az role assignment create --assignee user@contoso.com --role "Reader" --scope /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Storage/storageAccounts/&lt;storage-account&gt;</code></pre><h3 id="interpret-access-assignments">2.3 Interpret Access Assignments</h3><h4>Role Assignments Tab</h4><ul>
<li>View effective permissions for users/groups</li>
<li>Check deny assignments (Azure Blueprints, managed apps)</li>
<li>Understand inheritance from parent scopes</li>
</ul><h4>Access Control (IAM)</h4><ul>
<li><strong>Check Access</strong>: see what permissions a user has</li>
<li><strong>Role Assignments</strong>: view all role assignments</li>
<li><strong>Deny Assignments</strong>: view deny rules (override allow)</li>
</ul>` },
        { id: "ig-subscriptions-governance", label: "Manage Azure Subscriptions and Governance",
          content: `<h3 id="configure-azure-policy">3.1 Configure Azure Policy</h3><h4>Azure Policy Concepts</h4><ul>
<li><strong>Policy Definition</strong>: the rule to enforce (JSON)</li>
<li><strong>Policy Assignment</strong>: apply policy to a scope</li>
<li><strong>Initiative</strong>: group of policy definitions</li>
<li><strong>Compliance</strong>: track resource compliance status</li>
</ul><h4>Common Built-in Policies</h4><ul>
<li>Allowed virtual machine SKUs</li>
<li>Require tag on resources</li>
<li>Allowed locations</li>
<li>Require SQL Server 12.0</li>
<li>Audit VMs without managed disks</li>
</ul><pre><code># Assign a built-in policy
az policy assignment create --name 'audit-vm-managed-disks' --policy "audit-vm-manageddisks" --scope /subscriptions/&lt;subscription-id&gt;

# Create custom policy definition
az policy definition create --name 'require-tag' --rules policy-rules.json --params policy-params.json</code></pre><h4>Policy Effects</h4><ul>
<li><strong>Deny</strong>: block resource creation/update</li>
<li><strong>Audit</strong>: log non-compliant resources</li>
<li><strong>Append</strong>: add properties to resources</li>
<li><strong>Modify</strong>: add, update, or remove tags</li>
<li><strong>DeployIfNotExists</strong>: deploy resources if they don't exist</li>
<li><strong>AuditIfNotExists</strong>: audit if related resources don't exist</li>
</ul><h3 id="configure-resource-locks">3.2 Configure Resource Locks</h3><h4>Lock Types</h4><ul>
<li><strong>CanNotDelete</strong>: can read and modify, but cannot delete</li>
<li><strong>ReadOnly</strong>: can only read, cannot modify or delete</li>
</ul><pre><code># Add delete lock to resource group
az lock create --name LockGroup --lock-type CanNotDelete --resource-group myResourceGroup

# Add read-only lock to resource
az lock create --name LockVM --lock-type ReadOnly --resource-group myResourceGroup --resource-name myVM --resource-type Microsoft.Compute/virtualMachines</code></pre><div class="callout warn">
<span class="callout-icon">⚠️</span>
<div class="callout-body">
<strong>Exam Trap</strong>
<p>Locks apply to <strong>all users regardless of RBAC permissions</strong>, including Owners — but an Owner can still add/remove the lock itself. A lock at a parent scope (subscription or resource group) is inherited by every child resource.</p>
</div>
</div><h3 id="apply-manage-tags">3.3 Apply and Manage Tags</h3><h4>Tag Use Cases</h4><ul>
<li>Cost tracking and allocation</li>
<li>Environment identification (dev, test, prod)</li>
<li>Department/owner identification</li>
<li>Automation and deployment</li>
</ul><pre><code># Apply tags to resource group
az group update --name myResourceGroup --set tags.Environment=Production tags.CostCenter=IT

# Apply tags to resource
az resource tag --tags Environment=Production Owner=DevOps --ids /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/&lt;vm&gt;</code></pre><h4>Tag Policies</h4><ul>
<li>Require specific tags on resources</li>
<li>Inherit tags from resource group or subscription</li>
<li>Append tags automatically</li>
</ul><pre><code>{
  "if": {
    "field": "tags.Environment",
    "exists": "false"
  },
  "then": {
    "effect": "deny"
  }
}</code></pre><h3 id="manage-resource-groups">3.4 Manage Resource Groups</h3><h4>Resource Group Characteristics</h4><ul>
<li>Logical container for resources</li>
<li>All resources must be in a resource group</li>
<li>Resources can only be in one resource group</li>
<li>Resource groups cannot be nested</li>
<li>Deleting a resource group deletes all resources</li>
</ul><pre><code># Create resource group
az group create --name myResourceGroup --location eastus

# Move resources between groups
az resource move --destination-group targetResourceGroup --ids &lt;resource-id-1&gt; &lt;resource-id-2&gt;

# Delete resource group
az group delete --name myResourceGroup --yes</code></pre><h3 id="manage-subscriptions">3.5 Manage Subscriptions</h3><h4>Subscription Purposes</h4><ul>
<li>Billing boundary</li>
<li>Access control boundary</li>
<li>Separate environments (dev, prod)</li>
<li>Organizational units (departments, projects)</li>
</ul><h4>Subscription Limits</h4><ul>
<li>Default limits per subscription (e.g., 25,000 VMs per region)</li>
<li>Can request increases for many limits</li>
<li>Some limits are hard limits</li>
</ul><pre><code># List subscriptions
az account list --output table

# Set active subscription
az account set --subscription &lt;subscription-id&gt;

# Transfer subscription (via Azure Portal or API)</code></pre><h3 id="manage-management-groups">3.6 Manage Management Groups</h3><h4>Management Group Hierarchy</h4><ul>
<li>Root management group (automatic)</li>
<li>Up to 6 levels of depth (excluding the root level)</li>
<li>Each subscription can have one parent management group</li>
<li>Each management group can have multiple children</li>
</ul><pre><code># Create management group
az account management-group create --name "IT-Department" --display-name "IT Department"

# Add subscription to management group
az account management-group subscription add --name "IT-Department" --subscription &lt;subscription-id&gt;</code></pre><h4>Benefits</h4><ul>
<li>Apply policies across multiple subscriptions</li>
<li>Organize subscriptions by department, environment, geography</li>
<li>Azure RBAC applies across the management group hierarchy</li>
</ul><h3 id="manage-costs">3.7 Manage Costs</h3><h4>Azure Cost Management Tools</h4><ul>
<li><strong>Cost Analysis</strong>: view and analyze costs</li>
<li><strong>Budgets</strong>: set spending budgets with alerts</li>
<li><strong>Cost Alerts</strong>: automated notifications</li>
<li><strong>Azure Advisor</strong>: cost optimization recommendations</li>
</ul><pre><code># Create budget
az consumption budget create --budget-name MyBudget --amount 1000 --category Cost --time-grain Monthly --start-date 2025-01-01 --end-date 2025-12-31</code></pre><h4>Cost Optimization Strategies</h4><ul>
<li>Right-size VMs based on utilization</li>
<li>Use Azure Hybrid Benefit for Windows/SQL</li>
<li>Reserve instances for predictable workloads</li>
<li>Use Azure Spot VMs for interruptible workloads</li>
<li>Delete unused resources</li>
<li>Use auto-shutdown for dev/test VMs</li>
</ul><h4>Azure Advisor Cost Recommendations</h4><ul>
<li>Underutilized virtual machines</li>
<li>Unprovisioned ExpressRoute circuits</li>
<li>Idle virtual network gateways</li>
<li>Optimize costs with reserved instances</li>
</ul>` },
      ]},
      { id: "storage", title: "02 · Storage (15-20%)", color: "var(--c-orange)", items: [
        { id: "st-configure-access", label: "Configure Access to Storage", type: "recommended",
          content: `<h3 id="configure-firewalls-vnets">1.1 Configure Storage Firewalls and Virtual Networks</h3><h4>Network Security Options</h4><ul>
<li><strong>Public Endpoint</strong>: accessible from any network (default)</li>
<li><strong>Selected Networks</strong>: restrict to specific VNets/IP ranges</li>
<li><strong>Private Endpoint</strong>: accessible only through a private IP in a VNet</li>
</ul><h4>Firewall Configuration</h4><pre><code># Allow specific IP address
az storage account network-rule add --account-name mystorageaccount --ip-address 40.50.60.70

# Allow virtual network subnet
az storage account network-rule add --account-name mystorageaccount --vnet-name myVNet --subnet mySubnet

# Deny all traffic (allow only exceptions)
az storage account update --name mystorageaccount --default-action Deny</code></pre><h4>Service Endpoints vs. Private Endpoints</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Feature</th><th>Service Endpoint</th><th>Private Endpoint</th></tr>
</thead>
<tbody>
<tr><td><strong>Traffic</strong></td><td>Uses Azure backbone but keeps a public IP</td><td>Fully private IP address</td></tr>
<tr><td><strong>DNS</strong></td><td>Uses public DNS</td><td>Requires a private DNS zone</td></tr>
<tr><td><strong>Cost</strong></td><td>Free</td><td>Charges apply</td></tr>
<tr><td><strong>Configuration</strong></td><td>Configured on the subnet</td><td>Configured as a separate resource</td></tr>
</tbody>
</table>
</div><h3 id="configure-sas-tokens">1.2 Create and Use Shared Access Signature (SAS) Tokens</h3><h4>SAS Token Types</h4><ol>
<li><strong>Account SAS</strong>: access to multiple services (Blob, File, Queue, Table)</li>
<li><strong>Service SAS</strong>: access to a specific service</li>
<li><strong>User Delegation SAS</strong>: secured with Microsoft Entra ID credentials (most secure)</li>
</ol><h4>SAS Components</h4><ul>
<li><strong>Permissions</strong>: r (read), w (write), d (delete), l (list), a (add), c (create)</li>
<li><strong>Start/Expiry Time</strong>: when the SAS is valid</li>
<li><strong>IP Range</strong>: restrict to specific IPs</li>
<li><strong>Protocol</strong>: HTTPS only (recommended)</li>
</ul><pre><code># Generate account SAS token
az storage account generate-sas \\
  --account-name mystorageaccount \\
  --services bfqt \\
  --resource-types sco \\
  --permissions rwdlacup \\
  --expiry 2025-12-31T23:59:59Z \\
  --https-only

# Generate blob SAS token
az storage blob generate-sas \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --name myblob.txt \\
  --permissions r \\
  --expiry 2025-12-31 \\
  --https-only</code></pre><h4>Stored Access Policy</h4><ul>
<li>Define access policy separately from the SAS</li>
<li>Can revoke a SAS by modifying/deleting the policy</li>
<li>Only available for Service SAS (not Account SAS)</li>
</ul><pre><code># Create stored access policy
az storage container policy create \\
  --container-name mycontainer \\
  --name mypolicy \\
  --permissions rwdl \\
  --expiry 2025-12-31

# Generate SAS using stored access policy
az storage blob generate-sas \\
  --container-name mycontainer \\
  --name myblob.txt \\
  --policy-name mypolicy</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>A <strong>User Delegation SAS</strong> is the most secure SAS type because it's secured with Microsoft Entra ID credentials instead of the storage account key — if a scenario asks for the "most secure" way to hand out temporary blob access, this is usually the answer.</p>
</div>
</div><h3 id="configure-stored-access-policies">1.3 Configure Stored Access Policies</h3><h4>Benefits</h4><ul>
<li>Centralized control over SAS tokens</li>
<li>Ability to revoke access without regenerating keys</li>
<li>Modify permissions after the SAS is distributed</li>
</ul><h4>Limitations</h4><ul>
<li>Maximum 5 policies per container/share/queue/table</li>
<li>Cannot be used with Account SAS</li>
<li>Must be configured before generating the SAS token</li>
</ul><h3 id="manage-access-keys">1.4 Manage Access Keys</h3><h4>Storage Account Keys</h4><ul>
<li>Two access keys (key1 and key2) for rotation</li>
<li>Provide full access to the storage account</li>
<li>Regenerate periodically for security</li>
</ul><pre><code># List access keys
az storage account keys list --account-name mystorageaccount

# Regenerate a key
az storage account keys renew --account-name mystorageaccount --key primary

# Rotate keys process:
# 1. Regenerate key2
# 2. Update applications to use key2
# 3. Regenerate key1
# 4. Update remaining applications to use key1</code></pre><h4>Best Practices</h4><ul>
<li>Use Azure Key Vault to store keys</li>
<li>Rotate keys regularly (every 90 days)</li>
<li>Use managed identities instead of keys when possible</li>
<li>Monitor key usage with Azure Monitor</li>
</ul><h3 id="configure-identity-based-access">1.5 Configure Identity-Based Access</h3><h4>Microsoft Entra ID Integration</h4><ul>
<li>Use Microsoft Entra ID identities to access storage</li>
<li>No need to store access keys in code</li>
<li>Supports managed identities</li>
</ul><h4>Azure RBAC Roles for Storage</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Role</th><th>Permissions</th></tr>
</thead>
<tbody>
<tr><td><strong>Storage Blob Data Owner</strong></td><td>Full access to blob containers and data</td></tr>
<tr><td><strong>Storage Blob Data Contributor</strong></td><td>Read, write, delete blobs and containers</td></tr>
<tr><td><strong>Storage Blob Data Reader</strong></td><td>Read blob containers and data</td></tr>
<tr><td><strong>Storage Queue Data Contributor</strong></td><td>Read, write, delete queue messages</td></tr>
<tr><td><strong>Storage File Data SMB Share Contributor</strong></td><td>Read, write, delete on file shares via SMB</td></tr>
</tbody>
</table>
</div><pre><code># Assign blob data contributor role
az role assignment create \\
  --assignee user@contoso.com \\
  --role "Storage Blob Data Contributor" \\
  --scope /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Storage/storageAccounts/&lt;account&gt;

# Access blob with Microsoft Entra ID authentication
az storage blob list \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --auth-mode login</code></pre><h4>Managed Identity Access</h4><pre><code># Enable system-assigned managed identity on VM
az vm identity assign --name myVM --resource-group myResourceGroup

# Assign storage role to VM's managed identity
az role assignment create \\
  --assignee &lt;vm-managed-identity-principal-id&gt; \\
  --role "Storage Blob Data Contributor" \\
  --scope /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Storage/storageAccounts/&lt;account&gt;</code></pre>` },
        { id: "st-manage-accounts", label: "Configure and Manage Storage Accounts", type: "recommended",
          content: `<h3 id="create-configure-storage-accounts">2.1 Create and Configure Storage Accounts</h3><h4>Storage Account Types</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Type</th><th>Services</th><th>Use Case</th><th>Performance</th></tr>
</thead>
<tbody>
<tr><td><strong>Standard general-purpose v2</strong></td><td>Blob, File, Queue, Table</td><td>General use, most scenarios</td><td>Standard</td></tr>
<tr><td><strong>Premium block blobs</strong></td><td>Block blobs and append blobs</td><td>High transaction rates, low latency</td><td>Premium</td></tr>
<tr><td><strong>Premium file shares</strong></td><td>Files only</td><td>High-performance file shares</td><td>Premium</td></tr>
<tr><td><strong>Premium page blobs</strong></td><td>Page blobs only</td><td>Azure VM disks</td><td>Premium</td></tr>
</tbody>
</table>
</div><h4>Performance Tiers</h4><ul>
<li><strong>Standard</strong>: HDD-based, lower cost</li>
<li><strong>Premium</strong>: SSD-based, low latency, high throughput</li>
</ul><h4>Access Tiers (for Blob Storage)</h4><ul>
<li><strong>Hot</strong>: frequent access, higher storage cost, lower access cost</li>
<li><strong>Cool</strong>: infrequent access (recommended for 30+ days), lower storage cost, higher access cost</li>
<li><strong>Cold</strong>: rare access (recommended for 90+ days), optimized for backup scenarios</li>
<li><strong>Archive</strong>: offline storage (recommended for 180+ days), lowest cost, requires rehydration</li>
</ul><pre><code># Create storage account
az storage account create \\
  --name mystorageaccount \\
  --resource-group myResourceGroup \\
  --location eastus \\
  --sku Standard_LRS \\
  --kind StorageV2 \\
  --access-tier Hot

# Change access tier
az storage account update \\
  --name mystorageaccount \\
  --access-tier Cool</code></pre><h3 id="configure-redundancy">2.2 Configure Redundancy</h3><h4>Redundancy Options</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Option</th><th>Copies</th><th>Scope</th><th>Use Case</th><th>Cost</th></tr>
</thead>
<tbody>
<tr><td><strong>LRS</strong> (Locally Redundant)</td><td>3</td><td>Single datacenter</td><td>Development, test</td><td>Lowest</td></tr>
<tr><td><strong>ZRS</strong> (Zone Redundant)</td><td>3</td><td>Multiple availability zones in region</td><td>Production, high availability</td><td>Low</td></tr>
<tr><td><strong>GRS</strong> (Geo-Redundant)</td><td>6</td><td>Two regions (paired)</td><td>Disaster recovery</td><td>Medium</td></tr>
<tr><td><strong>GZRS</strong> (Geo-Zone Redundant)</td><td>6</td><td>Multiple zones + secondary region</td><td>Maximum durability</td><td>Highest</td></tr>
<tr><td><strong>RA-GRS</strong> (Read-Access GRS)</td><td>6</td><td>Two regions with read access to secondary</td><td>DR with read access</td><td>Medium</td></tr>
<tr><td><strong>RA-GZRS</strong></td><td>6</td><td>Zones + secondary region with read access</td><td>Maximum availability</td><td>Highest</td></tr>
</tbody>
</table>
</div><pre><code># Change redundancy
az storage account update \\
  --name mystorageaccount \\
  --sku Standard_GRS

# Failover to secondary region (for GRS/GZRS)
az storage account failover \\
  --name mystorageaccount \\
  --resource-group myResourceGroup</code></pre><h4>RPO (Recovery Point Objective)</h4><ul>
<li>LRS/ZRS: immediate</li>
<li>GRS/GZRS: typically &lt; 15 minutes (not guaranteed)</li>
</ul><h3 id="configure-object-replication">2.3 Configure Object Replication</h3><h4>Object Replication Features</h4><ul>
<li>Asynchronously copy blobs between storage accounts</li>
<li>Can be in different regions (cross-region)</li>
<li>Can be in the same region</li>
<li>Requires versioning enabled on source and destination</li>
</ul><pre><code># Prerequisites
# 1. Enable versioning on both accounts
az storage account blob-service-properties update \\
  --account-name mystorageaccount \\
  --enable-versioning true

# 2. Create replication policy (typically via Portal or ARM template)</code></pre><h4>Use Cases</h4><ul>
<li>Minimize latency (copy data closer to users)</li>
<li>Increase efficiency for compute workloads</li>
<li>Cost optimization (move data to lower-cost regions)</li>
<li>Data distribution</li>
</ul><h4>Requirements</h4><ul>
<li>Both accounts must be GPv2 or Premium Block Blob</li>
<li>Versioning enabled on both accounts</li>
<li>Change feed enabled on the source account</li>
</ul><h3 id="configure-storage-encryption">2.4 Configure Storage Account Encryption</h3><h4>Encryption at Rest</h4><ul>
<li><strong>Default</strong>: Microsoft-managed keys (automatic, no configuration)</li>
<li><strong>Customer-managed keys</strong>: keys stored in Azure Key Vault</li>
<li><strong>Customer-provided keys</strong>: client provides the key with each request</li>
</ul><pre><code># Configure customer-managed key
az storage account update \\
  --name mystorageaccount \\
  --encryption-key-source Microsoft.Keyvault \\
  --encryption-key-vault https://mykeyvault.vault.azure.net \\
  --encryption-key-name mykey \\
  --encryption-key-version &lt;version&gt;</code></pre><h4>Infrastructure Encryption</h4><ul>
<li>Double encryption (both hardware and software layers)</li>
<li>Enabled at account creation (cannot be changed later)</li>
</ul><pre><code># Create account with infrastructure encryption
az storage account create \\
  --name mystorageaccount \\
  --resource-group myResourceGroup \\
  --require-infrastructure-encryption</code></pre><h4>Encryption in Transit</h4><ul>
<li><strong>HTTPS</strong>: enforced by default</li>
<li><strong>Secure Transfer Required</strong>: reject HTTP requests</li>
</ul><pre><code># Require secure transfer
az storage account update \\
  --name mystorageaccount \\
  --https-only true</code></pre><h3 id="storage-explorer-azcopy">2.5 Manage Data with Azure Storage Explorer and AzCopy</h3><h4>Azure Storage Explorer</h4><ul>
<li>GUI tool for managing storage accounts</li>
<li>Cross-platform (Windows, Mac, Linux)</li>
<li>Supports blob, file, queue, table storage</li>
<li>Can use SAS, access keys, or Microsoft Entra ID authentication</li>
</ul><p><strong>Key Features</strong>:</p><ul>
<li>Upload/download files</li>
<li>Manage containers and file shares</li>
<li>Generate SAS tokens</li>
<li>Search and filter blobs</li>
<li>Set metadata and properties</li>
</ul><h4>AzCopy</h4><ul>
<li>Command-line tool for high-performance data transfer</li>
<li>Supports blob and file storage</li>
<li>Optimized for large-scale transfers</li>
</ul><pre><code># Copy file to blob storage
azcopy copy "C:\\local\\path\\file.txt" "https://mystorageaccount.blob.core.windows.net/mycontainer/file.txt?&lt;SAS-token&gt;"

# Copy directory to blob storage (recursive)
azcopy copy "C:\\local\\path\\*" "https://mystorageaccount.blob.core.windows.net/mycontainer?&lt;SAS-token&gt;" --recursive

# Sync local directory with blob container
azcopy sync "C:\\local\\path" "https://mystorageaccount.blob.core.windows.net/mycontainer?&lt;SAS-token&gt;" --recursive

# Copy between storage accounts
azcopy copy "https://source.blob.core.windows.net/container?&lt;SAS&gt;" "https://dest.blob.core.windows.net/container?&lt;SAS&gt;" --recursive

# Use Microsoft Entra ID authentication
azcopy login
azcopy copy "C:\\local\\path\\*" "https://mystorageaccount.blob.core.windows.net/mycontainer" --recursive</code></pre><p><strong>AzCopy Best Practices</strong>:</p><ul>
<li>Use <code>--cap-mbps</code> to limit bandwidth</li>
<li>Use <code>--block-size-mb</code> for large files</li>
<li>Use <code>--log-level</code> for detailed logging</li>
<li>Use <code>sync</code> instead of <code>copy</code> for incremental updates</li>
</ul><div class="callout warn">
<span class="callout-icon">⚠️</span>
<div class="callout-body">
<strong>Exam Trap</strong>
<p><strong>AzCopy</strong> is the command-line tool; <strong>Azure Storage Explorer</strong> is the GUI. Storage Explorer actually calls AzCopy under the hood for large transfers — know which tool a scenario is describing based on whether it mentions a script/pipeline (AzCopy) or interactive browsing (Storage Explorer).</p>
</div>
</div>` },
        { id: "st-files-blob", label: "Configure Azure Files and Azure Blob Storage",
          content: `<h3 id="create-configure-file-shares">3.1 Create and Configure File Shares</h3><h4>Azure Files Features</h4><ul>
<li>SMB and NFS protocol support</li>
<li>Can be mounted on Windows, Linux, macOS</li>
<li>Fully managed file shares</li>
<li>Can be cached with Azure File Sync</li>
</ul><h4>Performance Tiers</h4><ul>
<li><strong>Standard</strong>: HDD-based (transaction optimized, hot, cool)</li>
<li><strong>Premium</strong>: SSD-based, consistent low latency</li>
</ul><pre><code># Create file share
az storage share create \\
  --account-name mystorageaccount \\
  --name myfileshare \\
  --quota 100

# Create large file share (up to 100 TiB)
az storage account update \\
  --name mystorageaccount \\
  --enable-large-file-share

# Mount file share on Windows
net use Z: \\\\mystorageaccount.file.core.windows.net\\myfileshare /u:AZURE\\mystorageaccount &lt;storage-key&gt;

# Mount on Linux
sudo mount -t cifs //mystorageaccount.file.core.windows.net/myfileshare /mnt/myfileshare -o vers=3.0,username=mystorageaccount,password=&lt;storage-key&gt;,dir_mode=0777,file_mode=0777</code></pre><h4>SMB Protocol Versions</h4><ul>
<li>SMB 2.1: Windows 7, Windows Server 2008 R2</li>
<li>SMB 3.0: Windows 8, Windows Server 2012</li>
<li>SMB 3.1.1: Windows 10, Windows Server 2016+ (most secure)</li>
</ul><h3 id="create-configure-blob-containers">3.2 Create and Configure Blob Containers</h3><h4>Blob Types</h4><ol>
<li><strong>Block Blobs</strong>: text and binary data (up to 190.7 TiB)</li>
<li><strong>Append Blobs</strong>: optimized for append operations (logs)</li>
<li><strong>Page Blobs</strong>: random access files (VM disks, up to 8 TiB)</li>
</ol><h4>Public Access Levels</h4><ul>
<li><strong>Private</strong>: no anonymous access (default)</li>
<li><strong>Blob</strong>: anonymous read access to blobs only</li>
<li><strong>Container</strong>: anonymous read access to the container and blobs</li>
</ul><pre><code># Create container
az storage container create \\
  --account-name mystorageaccount \\
  --name mycontainer \\
  --public-access blob

# Upload blob
az storage blob upload \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --file /path/to/file.txt \\
  --name file.txt

# List blobs
az storage blob list \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --output table

# Download blob
az storage blob download \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --name file.txt \\
  --file /path/to/download/file.txt</code></pre><h3 id="configure-storage-tiers">3.3 Configure Storage Tiers</h3><h4>Blob-Level Tiering</h4><ul>
<li>Set the tier on individual blobs</li>
<li>Can move between Hot, Cool, Cold, Archive</li>
<li>Rehydration required for Archive tier (hours to retrieve)</li>
</ul><pre><code># Set blob tier
az storage blob set-tier \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --name file.txt \\
  --tier Cool

# Rehydrate from Archive
az storage blob set-tier \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --name file.txt \\
  --tier Hot \\
  --rehydrate-priority High</code></pre><h4>Rehydration Options</h4><ul>
<li><strong>Standard Priority</strong>: up to 15 hours</li>
<li><strong>High Priority</strong>: less than 1 hour (higher cost)</li>
</ul><h3 id="configure-snapshots-soft-delete">3.4 Configure Snapshots and Soft Delete</h3><h4>Blob Snapshots</h4><ul>
<li>Read-only point-in-time copy of a blob</li>
<li>Incremental (only changed blocks are stored)</li>
<li>Manual creation</li>
</ul><pre><code># Create snapshot
az storage blob snapshot \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --name file.txt

# List snapshots
az storage blob list \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --include snapshots

# Restore from snapshot
az storage blob copy start \\
  --source-container mycontainer \\
  --source-blob file.txt \\
  --source-snapshot &lt;snapshot-datetime&gt; \\
  --destination-container mycontainer \\
  --destination-blob file.txt</code></pre><h4>Soft Delete</h4><ul>
<li>Recover deleted blobs and snapshots</li>
<li>Retention period: 1-365 days</li>
<li>Applies to the entire storage account</li>
</ul><pre><code># Enable soft delete for blobs
az storage account blob-service-properties update \\
  --account-name mystorageaccount \\
  --enable-delete-retention true \\
  --delete-retention-days 7

# Enable soft delete for containers
az storage account blob-service-properties update \\
  --account-name mystorageaccount \\
  --enable-container-delete-retention true \\
  --container-delete-retention-days 7

# List deleted blobs
az storage blob list \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --include deleted

# Undelete blob
az storage blob undelete \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --name file.txt</code></pre><h3 id="configure-blob-versioning">3.5 Configure Blob Versioning</h3><h4>Versioning Features</h4><ul>
<li>Automatically maintain previous versions of a blob</li>
<li>Different from snapshots (automatic vs. manual)</li>
<li>Each write creates a new version</li>
<li>Can restore previous versions</li>
</ul><pre><code># Enable versioning
az storage account blob-service-properties update \\
  --account-name mystorageaccount \\
  --enable-versioning true

# List versions
az storage blob list \\
  --account-name mystorageaccount \\
  --container-name mycontainer \\
  --include versions

# Copy specific version
az storage blob copy start \\
  --source-container mycontainer \\
  --source-blob file.txt \\
  --source-version-id &lt;version-id&gt; \\
  --destination-container mycontainer \\
  --destination-blob file-restored.txt</code></pre><h4>Versioning vs. Snapshots vs. Soft Delete</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Feature</th><th>Versioning</th><th>Snapshots</th><th>Soft Delete</th></tr>
</thead>
<tbody>
<tr><td><strong>Automatic</strong></td><td>Yes</td><td>No</td><td>Yes (for deletes)</td></tr>
<tr><td><strong>Retention</strong></td><td>Manual deletion</td><td>Manual deletion</td><td>Time-based</td></tr>
<tr><td><strong>Granularity</strong></td><td>Every write</td><td>On-demand</td><td>Deletion only</td></tr>
<tr><td><strong>Recovery</strong></td><td>Any version</td><td>Snapshot point</td><td>Deleted items only</td></tr>
</tbody>
</table>
</div><h3 id="configure-lifecycle-management">3.6 Configure Blob Lifecycle Management</h3><h4>Lifecycle Policy Actions</h4><ul>
<li><strong>tierToCool</strong>: move to Cool tier</li>
<li><strong>tierToCold</strong>: move to Cold tier</li>
<li><strong>tierToArchive</strong>: move to Archive tier</li>
<li><strong>delete</strong>: delete the blob</li>
<li><strong>enableAutoTierToHotFromCool</strong>: move back to Hot on access</li>
</ul><pre><code>{
  "rules": [
    {
      "name": "rule1",
      "enabled": true,
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["logs/"]
        },
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 30
            },
            "tierToArchive": {
              "daysAfterModificationGreaterThan": 90
            },
            "delete": {
              "daysAfterModificationGreaterThan": 365
            }
          },
          "snapshot": {
            "delete": {
              "daysAfterCreationGreaterThan": 90
            }
          }
        }
      }
    }
  ]
}</code></pre><pre><code># Create lifecycle policy
az storage account management-policy create \\
  --account-name mystorageaccount \\
  --policy @policy.json</code></pre><h4>Use Cases</h4><ul>
<li>Archive old logs automatically</li>
<li>Delete temporary data after a certain period</li>
<li>Move infrequently accessed data to Cool tier</li>
<li>Optimize storage costs automatically</li>
</ul>` },
      ]},
      { id: "compute", title: "03 · Compute (20-25%)", color: "var(--c-purple)", items: [
        { id: "cp-arm-bicep", label: "Automate Deployment Using ARM Templates and Bicep", type: "recommended",
          content: `<h3 id="interpret-arm-templates">1.1 Interpret ARM Templates</h3><h4>ARM Template Structure</h4><pre><code>{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "vmName": {
      "type": "string",
      "defaultValue": "myVM"
    }
  },
  "variables": {
    "location": "[resourceGroup().location]"
  },
  "resources": [
    {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2023-03-01",
      "name": "[parameters('vmName')]",
      "location": "[variables('location')]",
      "properties": { }
    }
  ],
  "outputs": {
    "vmId": {
      "type": "string",
      "value": "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
    }
  }
}</code></pre><h4>Key Sections</h4><ul>
<li><strong>$schema</strong>: Defines template language version</li>
<li><strong>contentVersion</strong>: Template version (for tracking)</li>
<li><strong>parameters</strong>: Input values for deployment</li>
<li><strong>variables</strong>: Values computed during deployment</li>
<li><strong>resources</strong>: Azure resources to deploy</li>
<li><strong>outputs</strong>: Values returned after deployment</li>
</ul><h4>Common Functions</h4><ul>
<li><code>resourceGroup()</code>: Get resource group properties</li>
<li><code>subscription()</code>: Get subscription properties</li>
<li><code>concat()</code>: Concatenate strings</li>
<li><code>uniqueString()</code>: Create unique string (for resource names)</li>
<li><code>reference()</code>: Get runtime state of resource</li>
</ul><h3 id="modify-arm-templates">1.2 Modify ARM Templates</h3><h4>Adding Parameters</h4><pre><code>"parameters": {
  "vmSize": {
    "type": "string",
    "defaultValue": "Standard_B2s",
    "allowedValues": [
      "Standard_B2s",
      "Standard_D2s_v3",
      "Standard_D4s_v3"
    ],
    "metadata": {
      "description": "Size of the virtual machine"
    }
  }
}</code></pre><h4>Using Conditional Deployment</h4><pre><code>"resources": [
  {
    "condition": "[equals(parameters('environment'), 'production')]",
    "type": "Microsoft.Compute/virtualMachines",
    "name": "prodVM"
  }
]</code></pre><h4>Dependency Management</h4><pre><code>"resources": [
  {
    "type": "Microsoft.Network/networkInterfaces",
    "name": "myNIC",
    "dependsOn": [
      "[resourceId('Microsoft.Network/virtualNetworks', 'myVNet')]"
    ]
  }
]</code></pre><h3 id="deploy-arm-templates">1.3 Deploy ARM Templates</h3><pre><code># Deploy to resource group
az deployment group create \\
  --resource-group myResourceGroup \\
  --template-file template.json \\
  --parameters @parameters.json

# Deploy with inline parameters
az deployment group create \\
  --resource-group myResourceGroup \\
  --template-file template.json \\
  --parameters vmName=myVM vmSize=Standard_D2s_v3

# What-if deployment (preview changes)
az deployment group what-if \\
  --resource-group myResourceGroup \\
  --template-file template.json \\
  --parameters @parameters.json

# Deploy to subscription level
az deployment sub create \\
  --location eastus \\
  --template-file template.json</code></pre><h4>Deployment Modes</h4><ul>
<li><strong>Incremental</strong> (default): Adds resources, keeps existing resources</li>
<li><strong>Complete</strong>: Deletes resources not in template (use with caution)</li>
</ul><h3 id="export-deployment-arm-template">1.4 Export Deployment as ARM Template</h3><pre><code># Export resource group as template
az group export \\
  --name myResourceGroup \\
  --output-file exported-template.json

# Download deployment template
az deployment group export \\
  --name myDeployment \\
  --resource-group myResourceGroup

# Export specific resource
az resource show \\
  --resource-group myResourceGroup \\
  --name myVM \\
  --resource-type Microsoft.Compute/virtualMachines \\
  --query properties</code></pre><h3 id="interpret-bicep-files">1.5 Interpret Bicep Files</h3><h4>Bicep Syntax</h4><pre><code>// Parameters
param vmName string = 'myVM'
param location string = resourceGroup().location
param vmSize string = 'Standard_B2s'

// Variables
var nicName = '\${vmName}-nic'
var vnetName = '\${vmName}-vnet'

// Resources
resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'default'
        properties: {
          addressPrefix: '10.0.0.0/24'
        }
      }
    ]
  }
}

// Outputs
output vnetId string = vnet.id</code></pre><h4>Bicep Advantages</h4><ul>
<li>Simpler syntax than JSON</li>
<li>Better IntelliSense support</li>
<li>Automatic dependency management</li>
<li>Modular design with modules</li>
</ul><h3 id="modify-bicep-files">1.6 Modify Bicep Files</h3><h4>Using Modules</h4><pre><code>// main.bicep
module storage './storage.bicep' = {
  name: 'storageDeploy'
  params: {
    storageAccountName: 'mystorageaccount'
    location: location
  }
}

// storage.bicep
param storageAccountName string
param location string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

output storageAccountId string = storageAccount.id</code></pre><h4>Conditional Resources</h4><pre><code>param deployPublicIP bool = true

resource publicIP 'Microsoft.Network/publicIPAddresses@2023-04-01' = if (deployPublicIP) {
  name: 'myPublicIP'
  location: location
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}</code></pre><h3 id="deploy-bicep-files">1.7 Deploy Bicep Files</h3><pre><code># Deploy Bicep file
az deployment group create \\
  --resource-group myResourceGroup \\
  --template-file main.bicep \\
  --parameters vmName=myVM

# Build Bicep to ARM template
az bicep build --file main.bicep

# Decompile ARM to Bicep
az bicep decompile --file template.json</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p><strong>Bicep</strong> is a domain-specific language that compiles down to ARM JSON — there's no functional difference in what gets deployed, only in authoring experience. If a scenario emphasizes readability, IntelliSense, or modules, the answer is usually Bicep.</p>
</div>
</div>` },
        { id: "cp-vms", label: "Create and Configure Virtual Machines", type: "recommended",
          content: `<h3 id="create-virtual-machines">2.1 Create Virtual Machines</h3><h4>VM Creation Options</h4><ul>
<li>Azure Portal</li>
<li>Azure CLI</li>
<li>PowerShell</li>
<li>ARM templates / Bicep</li>
<li>Terraform</li>
</ul><pre><code># Create VM with Azure CLI
az vm create \\
  --resource-group myResourceGroup \\
  --name myVM \\
  --image Ubuntu2204 \\
  --size Standard_B2s \\
  --admin-username azureuser \\
  --generate-ssh-keys \\
  --public-ip-sku Standard \\
  --vnet-name myVNet \\
  --subnet mySubnet

# Create Windows VM
az vm create \\
  --resource-group myResourceGroup \\
  --name myWindowsVM \\
  --image Win2022Datacenter \\
  --size Standard_D2s_v3 \\
  --admin-username azureuser \\
  --admin-password &lt;password&gt;</code></pre><h4>VM Images</h4><ul>
<li><strong>Marketplace Images</strong>: Pre-configured by Microsoft/partners</li>
<li><strong>Custom Images</strong>: Your own generalized VMs</li>
<li><strong>Azure Compute Gallery</strong>: Centralized image management, version management, replication (formerly named Shared Image Gallery — see the callout above)</li>
</ul><h3 id="configure-disk-encryption">2.2 Configure Azure Disk Encryption</h3><h4>Encryption Options</h4><ol>
<li><strong>Server-Side Encryption (SSE)</strong>: Default, automatic</li>
<li><strong>Azure Disk Encryption (ADE)</strong>: BitLocker (Windows) / dm-crypt (Linux)</li>
<li><strong>Encryption at Host</strong>: Encryption on VM host</li>
</ol><h4>Azure Disk Encryption (ADE)</h4><pre><code># Prerequisites: Azure Key Vault

# Enable ADE on Linux VM
az vm encryption enable \\
  --resource-group myResourceGroup \\
  --name myVM \\
  --disk-encryption-keyvault myKeyVault \\
  --volume-type All

# Enable ADE on Windows VM
az vm encryption enable \\
  --resource-group myResourceGroup \\
  --name myWindowsVM \\
  --disk-encryption-keyvault myKeyVault \\
  --volume-type All

# Check encryption status
az vm encryption show \\
  --resource-group myResourceGroup \\
  --name myVM</code></pre><h4>Encryption at Host</h4><ul>
<li>Encrypts temp disk and OS/data disk caches</li>
<li>Enabled at VM creation (cannot be changed later)</li>
</ul><pre><code># Create VM with encryption at host
az vm create \\
  --resource-group myResourceGroup \\
  --name myVM \\
  --image Ubuntu2204 \\
  --encryption-at-host true</code></pre><h3 id="move-vms-resource-groups">2.3 Move VMs Between Resource Groups</h3><pre><code># Move VM and associated resources
az resource move \\
  --destination-group targetResourceGroup \\
  --ids $(az resource show --resource-group sourceRG --name myVM --resource-type Microsoft.Compute/virtualMachines --query id --output tsv)

# Note: Must move associated resources (NICs, disks, etc.) together</code></pre><p><strong>Important Considerations</strong>:</p><ul>
<li>VM must be stopped (deallocated)</li>
<li>Source and destination subscriptions must be in same tenant</li>
<li>Some resource types cannot be moved</li>
<li>Validate move operation first</li>
</ul><h3 id="manage-vm-sizes">2.4 Manage VM Sizes</h3><h4>VM Size Families</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Family</th><th>Description</th><th>Use Case</th></tr>
</thead>
<tbody>
<tr><td><strong>B-series</strong></td><td>Burstable</td><td>Development, test, small workloads</td></tr>
<tr><td><strong>D-series</strong></td><td>General purpose</td><td>Web servers, databases</td></tr>
<tr><td><strong>E-series</strong></td><td>Memory optimized</td><td>Large databases, in-memory analytics</td></tr>
<tr><td><strong>F-series</strong></td><td>Compute optimized</td><td>Gaming, analytics, batch processing</td></tr>
<tr><td><strong>L-series</strong></td><td>Storage optimized</td><td>Big data, SQL, NoSQL databases</td></tr>
<tr><td><strong>N-series</strong></td><td>GPU enabled</td><td>ML, rendering, video processing</td></tr>
</tbody>
</table>
</div><pre><code># List available sizes in a region
az vm list-sizes --location eastus --output table

# Resize VM (VM must be stopped)
az vm deallocate --resource-group myResourceGroup --name myVM
az vm resize --resource-group myResourceGroup --name myVM --size Standard_D4s_v3
az vm start --resource-group myResourceGroup --name myVM

# Resize without downtime (if size is available in current cluster)
az vm resize --resource-group myResourceGroup --name myVM --size Standard_D4s_v3</code></pre><h3 id="deploy-vms-availability-zones">2.5 Deploy VMs to Availability Zones</h3><h4>Availability Zones</h4><ul>
<li>Physically separate datacenters within a region</li>
<li>Protects from datacenter failures</li>
<li>3 zones per supported region</li>
<li>99.99% SLA (vs. 99.95% for single VM with Premium SSD)</li>
</ul><pre><code># Create VM in availability zone
az vm create \\
  --resource-group myResourceGroup \\
  --name myVM \\
  --image Ubuntu2204 \\
  --zone 1 \\
  --size Standard_D2s_v3

# Create VMs in multiple zones
for zone in 1 2 3; do
  az vm create \\
    --resource-group myResourceGroup \\
    --name myVM-zone$zone \\
    --zone $zone \\
    --image Ubuntu2204
done</code></pre><p><strong>Important</strong>:</p><ul>
<li>Cannot change zones after VM creation</li>
<li>Must use Standard SKU public IP and load balancer</li>
<li>Managed disks are automatically zone-redundant</li>
</ul><h3 id="deploy-vms-availability-sets">2.6 Deploy VMs to Availability Sets</h3><h4>Availability Sets</h4><ul>
<li>Logical grouping within a datacenter</li>
<li>Protects from hardware failures and updates</li>
<li>99.95% SLA (for 2+ VMs in availability set)</li>
</ul><p><strong>Fault Domains (FD)</strong>: Separate power/network (max 3)<br/>
<strong>Update Domains (UD)</strong>: Separate update groups (max 20)</p><pre><code># Create availability set
az vm availability-set create \\
  --resource-group myResourceGroup \\
  --name myAvailabilitySet \\
  --platform-fault-domain-count 2 \\
  --platform-update-domain-count 5

# Create VM in availability set
az vm create \\
  --resource-group myResourceGroup \\
  --name myVM \\
  --availability-set myAvailabilitySet \\
  --image Ubuntu2204</code></pre><p><strong>Limitations</strong>:</p><ul>
<li>Cannot combine with availability zones</li>
<li>Must specify at VM creation (cannot add later)</li>
<li>All VMs must be in same availability set</li>
</ul><div class="callout warn">
<span class="callout-icon">⚠️</span>
<div class="callout-body">
<strong>Exam Trap</strong>
<p><strong>Availability Zones</strong> protect against datacenter failure (99.99% SLA); <strong>Availability Sets</strong> only protect against rack-level hardware/update failure within a single datacenter (99.95% SLA). The two cannot be combined on the same VM — know which SLA number pairs with which feature.</p>
</div>
</div><h3 id="configure-vmss">2.7 Configure Virtual Machine Scale Sets (VMSS)</h3><h4>VMSS Features</h4><ul>
<li>Auto-scaling (metric-based or schedule-based)</li>
<li>Load balanced across instances</li>
<li>Automatic OS updates</li>
<li>Instance repair policies</li>
</ul><pre><code># Create VMSS
az vmss create \\
  --resource-group myResourceGroup \\
  --name myVMSS \\
  --image Ubuntu2204 \\
  --instance-count 2 \\
  --vm-sku Standard_D2s_v3 \\
  --admin-username azureuser \\
  --generate-ssh-keys \\
  --load-balancer myLoadBalancer

# Scale manually
az vmss scale \\
  --resource-group myResourceGroup \\
  --name myVMSS \\
  --new-capacity 5

# Configure autoscale
az monitor autoscale create \\
  --resource-group myResourceGroup \\
  --resource myVMSS \\
  --resource-type Microsoft.Compute/virtualMachineScaleSets \\
  --name autoscale \\
  --min-count 2 \\
  --max-count 10 \\
  --count 2

# Add scale-out rule (CPU &gt; 75%)
az monitor autoscale rule create \\
  --resource-group myResourceGroup \\
  --autoscale-name autoscale \\
  --condition "Percentage CPU &gt; 75 avg 5m" \\
  --scale out 1

# Add scale-in rule (CPU &lt; 25%)
az monitor autoscale rule create \\
  --resource-group myResourceGroup \\
  --autoscale-name autoscale \\
  --condition "Percentage CPU &lt; 25 avg 5m" \\
  --scale in 1</code></pre><h4>VMSS Orchestration Modes</h4><ul>
<li><strong>Uniform</strong>: Identical VMs, better for large-scale stateless workloads</li>
<li><strong>Flexible</strong>: Mix of VM sizes and types, better control</li>
</ul><h4>VMSS Update Policy</h4><ul>
<li><strong>Automatic</strong>: Instances updated immediately</li>
<li><strong>Rolling</strong>: Instances updated in batches</li>
<li><strong>Manual</strong>: You control when instances are updated</li>
</ul>` },
        { id: "cp-containers", label: "Provision and Manage Containers",
          content: `<h3 id="manage-acr">3.1 Manage Azure Container Registry (ACR)</h3><h4>ACR Features</h4><ul>
<li>Private container registry</li>
<li>Integrated with Azure services</li>
<li>Geo-replication for multi-region deployments</li>
<li>Security scanning and vulnerability assessment</li>
</ul><h4>ACR SKUs</h4><div class="table-wrap">
<table>
<thead>
<tr><th>SKU</th><th>Storage</th><th>Throughput</th><th>Use Case</th></tr>
</thead>
<tbody>
<tr><td><strong>Basic</strong></td><td>10 GB</td><td>Low</td><td>Development</td></tr>
<tr><td><strong>Standard</strong></td><td>100 GB</td><td>Medium</td><td>Production</td></tr>
<tr><td><strong>Premium</strong></td><td>500 GB</td><td>High</td><td>Geo-replication, VNet integration</td></tr>
</tbody>
</table>
</div><pre><code># Create container registry
az acr create \\
  --resource-group myResourceGroup \\
  --name myContainerRegistry \\
  --sku Standard \\
  --admin-enabled true

# Log in to ACR
az acr login --name myContainerRegistry

# Build and push image
az acr build \\
  --registry myContainerRegistry \\
  --image myapp:v1 \\
  --file Dockerfile .

# List images
az acr repository list --name myContainerRegistry --output table

# List tags
az acr repository show-tags \\
  --name myContainerRegistry \\
  --repository myapp \\
  --output table

# Pull image
docker pull mycontainerregistry.azurecr.io/myapp:v1</code></pre><h4>ACR Tasks</h4><ul>
<li>Build images in cloud</li>
<li>Multi-step tasks</li>
<li>Triggered builds (code commit, base image update)</li>
</ul><pre><code># Quick build
az acr build --registry myContainerRegistry --image myapp:v2 .

# Create task for automatic builds
az acr task create \\
  --registry myContainerRegistry \\
  --name buildtask \\
  --image myapp:{{.Run.ID}} \\
  --context https://github.com/user/repo.git \\
  --file Dockerfile \\
  --git-access-token &lt;PAT&gt;</code></pre><h3 id="create-configure-aci">3.2 Create and Configure Azure Container Instances (ACI)</h3><h4>ACI Features</h4><ul>
<li>Fastest way to run containers</li>
<li>No orchestration needed</li>
<li>Per-second billing</li>
<li>Both Windows and Linux containers</li>
</ul><pre><code># Create container instance
az container create \\
  --resource-group myResourceGroup \\
  --name mycontainer \\
  --image mcr.microsoft.com/azuredocs/aci-helloworld \\
  --dns-name-label myapp-unique \\
  --ports 80

# Create with private registry
az container create \\
  --resource-group myResourceGroup \\
  --name mycontainer \\
  --image mycontainerregistry.azurecr.io/myapp:v1 \\
  --registry-login-server mycontainerregistry.azurecr.io \\
  --registry-username &lt;username&gt; \\
  --registry-password &lt;password&gt; \\
  --dns-name-label myapp

# View logs
az container logs \\
  --resource-group myResourceGroup \\
  --name mycontainer

# Execute command in container
az container exec \\
  --resource-group myResourceGroup \\
  --name mycontainer \\
  --exec-command /bin/bash</code></pre><h4>Container Groups</h4><ul>
<li>Deploy multiple containers together</li>
<li>Share network, storage, lifecycle</li>
<li>Similar to Kubernetes pod</li>
</ul><pre><code># YAML definition for container group
apiVersion: '2021-09-01'
location: eastus
name: mycontainergroup
properties:
  containers:
  - name: web
    properties:
      image: nginx
      ports:
      - port: 80
      resources:
        requests:
          cpu: 1
          memoryInGb: 1.5
  - name: sidecar
    properties:
      image: alpine
      command: ["/bin/sh", "-c", "while true; do sleep 30; done"]
      resources:
        requests:
          cpu: 0.5
          memoryInGb: 0.5
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 80</code></pre><pre><code># Deploy container group
az container create \\
  --resource-group myResourceGroup \\
  --file containergroup.yaml</code></pre><h3 id="create-configure-container-apps">3.3 Create and Configure Azure Container Apps</h3><h4>Container Apps Features</h4><ul>
<li>Built on Kubernetes (abstracted away)</li>
<li>Auto-scaling (scale to zero)</li>
<li>HTTPS ingress</li>
<li>Traffic splitting (A/B testing, blue-green)</li>
<li>Managed revisions</li>
</ul><pre><code># Create Container Apps environment
az containerapp env create \\
  --name myEnvironment \\
  --resource-group myResourceGroup \\
  --location eastus

# Create container app
az containerapp create \\
  --name myapp \\
  --resource-group myResourceGroup \\
  --environment myEnvironment \\
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \\
  --target-port 80 \\
  --ingress external \\
  --min-replicas 0 \\
  --max-replicas 10

# Update container app
az containerapp update \\
  --name myapp \\
  --resource-group myResourceGroup \\
  --image mycontainerregistry.azurecr.io/myapp:v2

# View revisions
az containerapp revision list \\
  --name myapp \\
  --resource-group myResourceGroup \\
  --output table

# Configure traffic splitting
az containerapp ingress traffic set \\
  --name myapp \\
  --resource-group myResourceGroup \\
  --revision-weight latest=80 previous=20</code></pre><h4>Scaling Configuration</h4><pre><code># Configure autoscaling
az containerapp update \\
  --name myapp \\
  --resource-group myResourceGroup \\
  --min-replicas 1 \\
  --max-replicas 10 \\
  --scale-rule-name http-rule \\
  --scale-rule-type http \\
  --scale-rule-metadata concurrentRequests=50</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p><strong>ACI vs. ACA vs. AKS</strong>: use ACI for simple, single/few-container workloads with no orchestration; ACA (Container Apps) for microservices needing scale-to-zero and traffic splitting without managing Kubernetes; AKS for full Kubernetes control. If a scenario mentions "no orchestration needed" or "fastest way to run a container," the answer is ACI.</p>
</div>
</div>` },
        { id: "cp-app-service", label: "Create and Configure Azure App Service",
          content: `<h3 id="provision-app-service-plans">4.1 Provision App Service Plans</h3><h4>App Service Plan Tiers</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Tier</th><th>Features</th><th>Use Case</th></tr>
</thead>
<tbody>
<tr><td><strong>Free (F1)</strong></td><td>Shared compute, 60 min/day</td><td>Learning, testing</td></tr>
<tr><td><strong>Shared (D1)</strong></td><td>Shared compute, 240 min/day</td><td>Small apps</td></tr>
<tr><td><strong>Basic (B1-B3)</strong></td><td>Dedicated compute, manual scale</td><td>Development</td></tr>
<tr><td><strong>Standard (S1-S3)</strong></td><td>Auto-scale, staging slots, backups</td><td>Production</td></tr>
<tr><td><strong>Premium (P1v3-P3v3)</strong></td><td>Enhanced performance, VNet integration</td><td>High-performance production</td></tr>
<tr><td><strong>Isolated (I1v2-I3v2)</strong></td><td>App Service Environment, network isolation</td><td>Enterprise, compliance</td></tr>
</tbody>
</table>
</div><pre><code># Create App Service plan
az appservice plan create \\
  --name myAppServicePlan \\
  --resource-group myResourceGroup \\
  --sku B1 \\
  --is-linux

# Scale up (change tier)
az appservice plan update \\
  --name myAppServicePlan \\
  --resource-group myResourceGroup \\
  --sku S1

# Scale out (add instances)
az appservice plan update \\
  --name myAppServicePlan \\
  --resource-group myResourceGroup \\
  --number-of-workers 3</code></pre><h3 id="configure-scaling-app-service">4.2 Configure Scaling for App Service Plans</h3><h4>Manual Scaling</h4><pre><code># Scale to specific instance count
az appservice plan update \\
  --name myAppServicePlan \\
  --resource-group myResourceGroup \\
  --number-of-workers 5</code></pre><h4>Auto-scaling (Standard tier and above)</h4><pre><code># Create autoscale setting
az monitor autoscale create \\
  --resource-group myResourceGroup \\
  --resource myAppServicePlan \\
  --resource-type Microsoft.Web/serverfarms \\
  --name autoscale \\
  --min-count 2 \\
  --max-count 10 \\
  --count 2

# Add scale-out rule
az monitor autoscale rule create \\
  --resource-group myResourceGroup \\
  --autoscale-name autoscale \\
  --condition "CpuPercentage &gt; 70 avg 5m" \\
  --scale out 2

# Add scale-in rule
az monitor autoscale rule create \\
  --resource-group myResourceGroup \\
  --autoscale-name autoscale \\
  --condition "CpuPercentage &lt; 30 avg 5m" \\
  --scale in 1</code></pre><h3 id="create-web-apps">4.3 Create App Service Web Apps</h3><pre><code># Create web app
az webapp create \\
  --resource-group myResourceGroup \\
  --plan myAppServicePlan \\
  --name myWebApp \\
  --runtime "NODE:18-lts"

# Create web app with deployment
az webapp up \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --runtime "PYTHON:3.11" \\
  --sku B1

# Deploy from local Git
az webapp deployment source config-local-git \\
  --name myWebApp \\
  --resource-group myResourceGroup

# Deploy from GitHub
az webapp deployment source config \\
  --name myWebApp \\
  --resource-group myResourceGroup \\
  --repo-url https://github.com/user/repo \\
  --branch main \\
  --manual-integration</code></pre><h3 id="configure-certificates-domains">4.4 Configure Certificates and Custom Domains</h3><h4>Custom Domain</h4><pre><code># Add custom domain
az webapp config hostname add \\
  --webapp-name myWebApp \\
  --resource-group myResourceGroup \\
  --hostname www.contoso.com

# Note: Must configure DNS CNAME or A record first
# CNAME: www.contoso.com -&gt; mywebapp.azurewebsites.net
# OR
# A record: www.contoso.com -&gt; &lt;app-ip&gt;
# TXT record: asuid.www.contoso.com -&gt; &lt;verification-id&gt;</code></pre><h4>SSL/TLS Certificates</h4><pre><code># Create managed certificate (free, requires custom domain)
az webapp config ssl create \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --hostname www.contoso.com

# Upload certificate
az webapp config ssl upload \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --certificate-file certificate.pfx \\
  --certificate-password &lt;password&gt;

# Bind certificate
az webapp config ssl bind \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --certificate-thumbprint &lt;thumbprint&gt; \\
  --ssl-type SNI

# Enforce HTTPS
az webapp update \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --https-only true</code></pre><h3 id="configure-application-settings">4.5 Configure Application Settings</h3><pre><code># Set app settings (environment variables)
az webapp config appsettings set \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --settings \\
    DB_HOST=mydbserver.database.windows.net \\
    DB_NAME=mydb \\
    API_KEY=@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/apikey/)

# List app settings
az webapp config appsettings list \\
  --resource-group myResourceGroup \\
  --name myWebApp

# Configure connection strings
az webapp config connection-string set \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --connection-string-type SQLAzure \\
  --settings DefaultConnection="Server=tcp:myserver.database.windows.net;Database=mydb"</code></pre><h3 id="configure-backup">4.6 Configure Backup for App Service</h3><pre><code># Create storage account for backups
az storage account create \\
  --name mybackupstorage \\
  --resource-group myResourceGroup

# Create storage container
az storage container create \\
  --name backups \\
  --account-name mybackupstorage

# Generate SAS token
sasToken=$(az storage container generate-sas \\
  --account-name mybackupstorage \\
  --name backups \\
  --permissions rwdl \\
  --expiry 2026-01-01 \\
  --output tsv)

# Configure backup
az webapp config backup create \\
  --resource-group myResourceGroup \\
  --webapp-name myWebApp \\
  --container-url "https://mybackupstorage.blob.core.windows.net/backups?$sasToken" \\
  --backup-name mybackup

# Configure scheduled backup
az webapp config backup update \\
  --resource-group myResourceGroup \\
  --webapp-name myWebApp \\
  --container-url "https://mybackupstorage.blob.core.windows.net/backups?$sasToken" \\
  --frequency 1d \\
  --retain-one true \\
  --retention 30</code></pre><p><strong>Backup includes</strong>:</p><ul>
<li>App configuration</li>
<li>File content</li>
<li>Connected database (if configured)</li>
</ul><p><strong>Requirements</strong>:</p><ul>
<li>Standard tier or higher</li>
<li>Storage account in same subscription</li>
</ul><h3 id="configure-networking">4.7 Configure Networking for App Service</h3><h4>VNet Integration (Outbound)</h4><pre><code># Integrate with VNet (for outbound traffic)
az webapp vnet-integration add \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --vnet myVNet \\
  --subnet appSubnet</code></pre><h4>Access Restrictions (Inbound)</h4><pre><code># Add IP restriction
az webapp config access-restriction add \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --rule-name AllowOffice \\
  --action Allow \\
  --ip-address 203.0.113.0/24 \\
  --priority 100

# Add VNet restriction
az webapp config access-restriction add \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --rule-name AllowVNet \\
  --action Allow \\
  --vnet-name myVNet \\
  --subnet mySubnet \\
  --priority 200</code></pre><h3 id="configure-deployment-slots">4.8 Configure Deployment Slots</h3><h4>Deployment Slots Features</h4><ul>
<li>Swap slots with zero downtime</li>
<li>Warm up before swap</li>
<li>Auto-swap (for CI/CD)</li>
<li>Slot-specific settings</li>
</ul><pre><code># Create deployment slot
az webapp deployment slot create \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --slot staging

# Deploy to staging slot
az webapp deployment source config \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --slot staging \\
  --repo-url https://github.com/user/repo \\
  --branch develop

# Swap slots (staging -&gt; production)
az webapp deployment slot swap \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --slot staging \\
  --target-slot production

# Configure slot-specific setting (won't swap)
az webapp config appsettings set \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --slot staging \\
  --settings ENVIRONMENT=Staging \\
  --slot-settings ENVIRONMENT</code></pre><p><strong>Slot Settings</strong>:</p><ul>
<li>Sticky (slot-specific): Stay with slot during swap</li>
<li>Non-sticky: Move with content during swap</li>
</ul><div class="callout warn">
<span class="callout-icon">⚠️</span>
<div class="callout-body">
<strong>Exam Trap</strong>
<p>Deployment slots require <strong>Standard tier or higher</strong> — Basic and below don't support them. If a scenario asks for zero-downtime deployment with quick rollback and the plan is Free/Shared/Basic, the first step is scaling up the plan before slots can be configured.</p>
</div>
</div>` },
      ]},
      { id: "networking", title: "04 · Networking (15-20%)", color: "var(--c-lime)", items: [
        { id: "nw-vnets", label: "Configure and Manage Virtual Networks", type: "recommended",
          content: `<h3 id="create-configure-vnets">1.1 Create and Configure Virtual Networks (VNets)</h3><h4>VNet Characteristics</h4><ul>
<li>Private network in Azure</li>
<li>Logically isolated from other VNets</li>
<li>Can be divided into subnets</li>
<li>Regional resource (cannot span regions)</li>
<li>Can peer with other VNets</li>
</ul><pre><code># Create virtual network
az network vnet create \\
  --resource-group myResourceGroup \\
  --name myVNet \\
  --address-prefix 10.0.0.0/16 \\
  --location eastus

# Add address prefix to existing VNet
az network vnet update \\
  --resource-group myResourceGroup \\
  --name myVNet \\
  --address-prefixes 10.0.0.0/16 192.168.0.0/16</code></pre><h4>Address Space Planning</h4><ul>
<li>Use private IP ranges (RFC 1918):
        <ul>
<li>10.0.0.0/8 (10.0.0.0 - 10.255.255.255)</li>
<li>172.16.0.0/12 (172.16.0.0 - 172.31.255.255)</li>
<li>192.168.0.0/16 (192.168.0.0 - 192.168.255.255)</li>
</ul>
</li>
<li>Avoid overlapping address spaces for peered VNets</li>
<li>Plan for future growth</li>
</ul><h3 id="create-configure-subnets">1.2 Create and Configure Subnets</h3><h4>Subnet Considerations</h4><ul>
<li>Minimum size: /29 (8 IPs, 3 usable)</li>
<li>Maximum size: Same as VNet address space</li>
<li>Azure reserves 5 IPs per subnet (first 4 and last 1)</li>
</ul><p><strong>Reserved IPs</strong> (example: 10.0.0.0/24):</p><ul>
<li>10.0.0.0: Network address</li>
<li>10.0.0.1: Azure gateway (default)</li>
<li>10.0.0.2: Azure DNS</li>
<li>10.0.0.3: Azure DNS</li>
<li>10.0.0.255: Broadcast</li>
</ul><pre><code># Create subnet
az network vnet subnet create \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name mySubnet \\
  --address-prefixes 10.0.1.0/24

# Create subnet with service endpoints
az network vnet subnet create \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name appSubnet \\
  --address-prefixes 10.0.2.0/24 \\
  --service-endpoints Microsoft.Storage Microsoft.Sql

# Delegate subnet to service (e.g., Azure SQL Managed Instance)
az network vnet subnet update \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name dbSubnet \\
  --delegations Microsoft.Sql/managedInstances</code></pre><h4>Special Subnets</h4><ul>
<li><strong>GatewaySubnet</strong>: For VPN/ExpressRoute gateways (must be named exactly)</li>
<li><strong>AzureBastionSubnet</strong>: For Azure Bastion (must be named exactly, minimum /26)</li>
<li><strong>AzureFirewallSubnet</strong>: For Azure Firewall (must be named exactly, minimum /26)</li>
</ul><h3 id="create-configure-vnet-peering">1.3 Create and Configure VNet Peering</h3><h4>VNet Peering Types</h4><ol>
<li><strong>Regional Peering</strong>: VNets in same region</li>
<li><strong>Global Peering</strong>: VNets in different regions</li>
</ol><h4>Peering Characteristics</h4><ul>
<li>Non-transitive (A↔B and B↔C doesn't mean A↔C)</li>
<li>Low latency, high bandwidth</li>
<li>Traffic stays on Microsoft backbone</li>
<li>No downtime required</li>
</ul><pre><code># Create peering from VNet1 to VNet2
az network vnet peering create \\
  --resource-group myResourceGroup \\
  --name VNet1-to-VNet2 \\
  --vnet-name VNet1 \\
  --remote-vnet VNet2 \\
  --allow-vnet-access \\
  --allow-forwarded-traffic

# Create reverse peering from VNet2 to VNet1
az network vnet peering create \\
  --resource-group myResourceGroup \\
  --name VNet2-to-VNet1 \\
  --vnet-name VNet2 \\
  --remote-vnet VNet1 \\
  --allow-vnet-access \\
  --allow-forwarded-traffic

# Enable gateway transit (hub-spoke topology)
az network vnet peering update \\
  --resource-group myResourceGroup \\
  --name Hub-to-Spoke \\
  --vnet-name HubVNet \\
  --set allowGatewayTransit=true

az network vnet peering update \\
  --resource-group myResourceGroup \\
  --name Spoke-to-Hub \\
  --vnet-name SpokeVNet \\
  --set useRemoteGateways=true</code></pre><h4>Peering Options</h4><ul>
<li><strong>Allow Virtual Network Access</strong>: Enable communication between VNets</li>
<li><strong>Allow Forwarded Traffic</strong>: Allow traffic forwarded by NVA</li>
<li><strong>Allow Gateway Transit</strong>: Share VPN/ExpressRoute gateway</li>
<li><strong>Use Remote Gateways</strong>: Use peer's gateway</li>
</ul><h3 id="configure-public-ip">1.4 Configure Public IP Addresses</h3><h4>Public IP SKUs</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Feature</th><th>Basic</th><th>Standard</th></tr>
</thead>
<tbody>
<tr><td><strong>Assignment</strong></td><td>Dynamic or Static</td><td>Static only</td></tr>
<tr><td><strong>Security</strong></td><td>Open by default</td><td>Closed by default (needs NSG)</td></tr>
<tr><td><strong>Availability Zones</strong></td><td>Not supported</td><td>Zone-redundant or zonal</td></tr>
<tr><td><strong>Load Balancer</strong></td><td>Basic LB</td><td>Standard LB</td></tr>
<tr><td><strong>Routing</strong></td><td>Regional</td><td>Global (any region)</td></tr>
</tbody>
</table>
</div><pre><code># Create basic public IP (dynamic)
az network public-ip create \\
  --resource-group myResourceGroup \\
  --name myPublicIP-Basic \\
  --sku Basic \\
  --allocation-method Dynamic

# Create standard public IP (static)
az network public-ip create \\
  --resource-group myResourceGroup \\
  --name myPublicIP-Standard \\
  --sku Standard \\
  --allocation-method Static

# Create zone-redundant public IP
az network public-ip create \\
  --resource-group myResourceGroup \\
  --name myPublicIP-ZoneRedundant \\
  --sku Standard \\
  --zone 1 2 3

# Associate with VM NIC
az network nic ip-config update \\
  --resource-group myResourceGroup \\
  --nic-name myNIC \\
  --name ipconfig1 \\
  --public-ip-address myPublicIP-Standard</code></pre><h4>Public IP Prefix</h4><ul>
<li>Reserve contiguous block of public IPs</li>
<li>Useful for firewall rules (allow entire range)</li>
<li>Minimum /28 (16 addresses)</li>
</ul><pre><code># Create public IP prefix
az network public-ip prefix create \\
  --resource-group myResourceGroup \\
  --name myIPPrefix \\
  --length 28

# Create public IP from prefix
az network public-ip create \\
  --resource-group myResourceGroup \\
  --name myPublicIP \\
  --public-ip-prefix myIPPrefix</code></pre><h3 id="configure-udr">1.5 Configure User-Defined Routes (UDR)</h3><h4>Route Types</h4><ol>
<li><strong>System Routes</strong>: Automatic, default routes</li>
<li><strong>User-Defined Routes</strong>: Custom routes you create</li>
<li><strong>Border Gateway Protocol (BGP)</strong>: Routes from on-premises</li>
</ol><h4>Common Routing Scenarios</h4><ul>
<li>Force traffic through firewall/NVA</li>
<li>Route traffic to on-premises</li>
<li>Override default internet route</li>
</ul><pre><code># Create route table
az network route-table create \\
  --resource-group myResourceGroup \\
  --name myRouteTable

# Add route to NVA (Network Virtual Appliance)
az network route-table route create \\
  --resource-group myResourceGroup \\
  --route-table-name myRouteTable \\
  --name RouteToNVA \\
  --address-prefix 10.1.0.0/16 \\
  --next-hop-type VirtualAppliance \\
  --next-hop-ip-address 10.0.1.4

# Add route to force internet traffic through NVA
az network route-table route create \\
  --resource-group myResourceGroup \\
  --route-table-name myRouteTable \\
  --name ForceInternetThroughNVA \\
  --address-prefix 0.0.0.0/0 \\
  --next-hop-type VirtualAppliance \\
  --next-hop-ip-address 10.0.1.4

# Associate route table with subnet
az network vnet subnet update \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name mySubnet \\
  --route-table myRouteTable</code></pre><h4>Next Hop Types</h4><ul>
<li><strong>VirtualAppliance</strong>: Traffic to NVA (firewall, router)</li>
<li><strong>VirtualNetworkGateway</strong>: Traffic to VPN gateway</li>
<li><strong>VirtualNetwork</strong>: Within VNet</li>
<li><strong>Internet</strong>: Direct to internet</li>
<li><strong>None</strong>: Drop traffic (blackhole)</li>
</ul><h3 id="configure-private-endpoints">1.6 Configure Private Endpoints</h3><h4>Private Endpoint Features</h4><ul>
<li>Private IP address in your VNet</li>
<li>Connect to Azure PaaS services privately</li>
<li>No public endpoint needed</li>
<li>Traffic stays on Microsoft backbone</li>
</ul><p><strong>Supported Services</strong>:</p><ul>
<li>Storage, SQL Database, Cosmos DB</li>
<li>Key Vault, App Service, Container Registry</li>
<li>Event Hubs, Service Bus</li>
<li>And many more...</li>
</ul><pre><code># Disable public network access on storage account
az storage account update \\
  --name mystorageaccount \\
  --resource-group myResourceGroup \\
  --public-network-access Disabled

# Create private endpoint
az network private-endpoint create \\
  --resource-group myResourceGroup \\
  --name myPrivateEndpoint \\
  --vnet-name myVNet \\
  --subnet mySubnet \\
  --private-connection-resource-id /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Storage/storageAccounts/mystorageaccount \\
  --group-id blob \\
  --connection-name myConnection

# Create private DNS zone
az network private-dns zone create \\
  --resource-group myResourceGroup \\
  --name privatelink.blob.core.windows.net

# Link DNS zone to VNet
az network private-dns link vnet create \\
  --resource-group myResourceGroup \\
  --zone-name privatelink.blob.core.windows.net \\
  --name myDNSLink \\
  --virtual-network myVNet \\
  --registration-enabled false

# Create DNS zone group (automatic DNS records)
az network private-endpoint dns-zone-group create \\
  --resource-group myResourceGroup \\
  --endpoint-name myPrivateEndpoint \\
  --name myZoneGroup \\
  --private-dns-zone privatelink.blob.core.windows.net \\
  --zone-name blob</code></pre><h3 id="configure-service-endpoints">1.7 Configure Service Endpoints</h3><h4>Service Endpoints vs. Private Endpoints</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Feature</th><th>Service Endpoint</th><th>Private Endpoint</th></tr>
</thead>
<tbody>
<tr><td><strong>IP Address</strong></td><td>Public (Microsoft-owned)</td><td>Private (your VNet)</td></tr>
<tr><td><strong>DNS</strong></td><td>Public DNS</td><td>Private DNS zone</td></tr>
<tr><td><strong>Cost</strong></td><td>Free</td><td>Charges per hour + data</td></tr>
<tr><td><strong>Configuration</strong></td><td>Subnet level</td><td>Resource level</td></tr>
<tr><td><strong>Network</strong></td><td>Still uses public IP backbone</td><td>Fully private</td></tr>
</tbody>
</table>
</div><pre><code># Enable service endpoint on subnet
az network vnet subnet update \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name mySubnet \\
  --service-endpoints Microsoft.Storage Microsoft.Sql

# Configure storage firewall to allow subnet
az storage account network-rule add \\
  --resource-group myResourceGroup \\
  --account-name mystorageaccount \\
  --vnet-name myVNet \\
  --subnet mySubnet</code></pre><h3 id="troubleshoot-network-connectivity">1.8 Troubleshoot Network Connectivity</h3><h4>Network Watcher Tools</h4><ul>
<li><strong>IP Flow Verify</strong>: Check if packet allowed/denied</li>
<li><strong>Next Hop</strong>: Determine routing</li>
<li><strong>Connection Troubleshoot</strong>: Check connectivity between resources</li>
<li><strong>Packet Capture</strong>: Capture network traffic</li>
<li><strong>NSG Flow Logs</strong>: Log traffic through NSGs</li>
</ul><pre><code># Enable Network Watcher (automatic in most regions)
az network watcher configure \\
  --resource-group NetworkWatcherRG \\
  --locations eastus \\
  --enabled true

# IP flow verify (check if traffic is allowed)
az network watcher test-ip-flow \\
  --resource-group myResourceGroup \\
  --vm myVM \\
  --direction Inbound \\
  --protocol TCP \\
  --local 10.0.0.4:80 \\
  --remote 203.0.113.1:80

# Next hop (check routing)
az network watcher show-next-hop \\
  --resource-group myResourceGroup \\
  --vm myVM \\
  --source-ip 10.0.0.4 \\
  --dest-ip 10.1.0.4

# Connection troubleshoot
az network watcher test-connectivity \\
  --resource-group myResourceGroup \\
  --source-resource myVM \\
  --dest-resource myOtherVM \\
  --protocol TCP \\
  --dest-port 80

# Effective routes (see all routes affecting a NIC)
az network nic show-effective-route-table \\
  --resource-group myResourceGroup \\
  --name myNIC

# Effective NSG rules
az network nic list-effective-nsg \\
  --resource-group myResourceGroup \\
  --name myNIC</code></pre>` },
        { id: "nw-secure-access", label: "Configure Secure Access to Virtual Networks", type: "recommended",
          content: `<h3 id="create-configure-nsg">2.1 Create and Configure Network Security Groups (NSG)</h3><h4>NSG Concepts</h4><ul>
<li>Filter traffic to/from Azure resources</li>
<li>Can associate with subnet or NIC</li>
<li>Rules evaluated by priority (100-4096)</li>
<li>Lower number = higher priority</li>
<li>Default rules (priority 65000+) cannot be deleted</li>
</ul><pre><code># Create NSG
az network nsg create \\
  --resource-group myResourceGroup \\
  --name myNSG

# Create inbound rule (allow HTTP)
az network nsg rule create \\
  --resource-group myResourceGroup \\
  --nsg-name myNSG \\
  --name AllowHTTP \\
  --priority 100 \\
  --source-address-prefixes '*' \\
  --source-port-ranges '*' \\
  --destination-address-prefixes '*' \\
  --destination-port-ranges 80 \\
  --protocol TCP \\
  --access Allow \\
  --direction Inbound

# Create rule with service tag
az network nsg rule create \\
  --resource-group myResourceGroup \\
  --nsg-name myNSG \\
  --name AllowAzureLoadBalancer \\
  --priority 110 \\
  --source-address-prefixes AzureLoadBalancer \\
  --destination-port-ranges '*' \\
  --protocol '*' \\
  --access Allow \\
  --direction Inbound

# Associate NSG with subnet
az network vnet subnet update \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name mySubnet \\
  --network-security-group myNSG

# Associate NSG with NIC
az network nic update \\
  --resource-group myResourceGroup \\
  --name myNIC \\
  --network-security-group myNSG</code></pre><h4>Default NSG Rules (Inbound)</h4><ol>
<li>AllowVNetInBound (65000): Allow VNet traffic</li>
<li>AllowAzureLoadBalancerInBound (65001): Allow health probes</li>
<li>DenyAllInBound (65500): Deny all other traffic</li>
</ol><h4>Default NSG Rules (Outbound)</h4><ol>
<li>AllowVNetOutBound (65000): Allow to VNet</li>
<li>AllowInternetOutBound (65001): Allow to internet</li>
<li>DenyAllOutBound (65500): Deny all other traffic</li>
</ol><h4>Service Tags</h4><ul>
<li><strong>Internet</strong>: Internet addresses</li>
<li><strong>VirtualNetwork</strong>: VNet address space</li>
<li><strong>AzureLoadBalancer</strong>: Azure health probes</li>
<li><strong>AzureCloud</strong>: All Azure public IPs</li>
<li><strong>Storage</strong>: Storage service IPs</li>
<li><strong>Sql</strong>: SQL Database IPs</li>
<li><strong>AzureActiveDirectory</strong>: Azure AD IPs</li>
</ul><h4>Application Security Groups (ASG)</h4><ul>
<li>Logical grouping of VMs</li>
<li>Simplify NSG rules</li>
<li>Group by role/tier (web, app, db)</li>
</ul><pre><code># Create ASGs
az network asg create \\
  --resource-group myResourceGroup \\
  --name webASG

az network asg create \\
  --resource-group myResourceGroup \\
  --name appASG

# Associate NIC with ASG
az network nic ip-config update \\
  --resource-group myResourceGroup \\
  --nic-name myWebNIC \\
  --name ipconfig1 \\
  --application-security-groups webASG

# Create NSG rule using ASG
az network nsg rule create \\
  --resource-group myResourceGroup \\
  --nsg-name myNSG \\
  --name AllowWebToApp \\
  --priority 200 \\
  --source-asgs webASG \\
  --destination-asgs appASG \\
  --destination-port-ranges 443 \\
  --protocol TCP \\
  --access Allow \\
  --direction Inbound</code></pre><div class="callout tip">
<span class="callout-icon">✅</span>
<div class="callout-body">
<strong>Exam Tip</strong>
<p>NSG default rules and their priorities (AllowVNetInBound/AllowVNetOutBound at 65000, AllowAzureLoadBalancerInBound/AllowInternetOutBound at 65001, DenyAllInBound/DenyAllOutBound at 65500) are worth memorizing exactly — verified current against Microsoft Learn. Custom rules always use priority 100–4096, so they're evaluated before any default rule.</p>
</div>
</div><h3 id="configure-azure-bastion">2.2 Configure Azure Bastion</h3><h4>Azure Bastion Features</h4><ul>
<li>Managed PaaS service</li>
<li>RDP/SSH without public IP on VMs</li>
<li>No NSG rules needed on Bastion subnet</li>
<li>Protection against port scanning</li>
<li>SSL/TLS connection to Azure portal</li>
</ul><pre><code># Create Bastion subnet (must be named AzureBastionSubnet, minimum /26)
az network vnet subnet create \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name AzureBastionSubnet \\
  --address-prefixes 10.0.255.0/26

# Create public IP for Bastion
az network public-ip create \\
  --resource-group myResourceGroup \\
  --name BastionPublicIP \\
  --sku Standard \\
  --allocation-method Static

# Create Bastion host
az network bastion create \\
  --resource-group myResourceGroup \\
  --name myBastion \\
  --public-ip-address BastionPublicIP \\
  --vnet-name myVNet \\
  --location eastus

# Connect to VM via Bastion (through Azure Portal)
# Portal &gt; Virtual Machine &gt; Connect &gt; Bastion</code></pre><h4>Bastion SKUs</h4><ul>
<li><strong>Basic</strong>: Standard features, 25 concurrent sessions</li>
<li><strong>Standard</strong>: File upload/download, more concurrent sessions, shareable links</li>
</ul><div class="callout note">
<span class="callout-icon">💡</span>
<div class="callout-body">
<strong>Note: Bastion now offers four SKUs</strong>
<p>Source material lists only Basic and Standard, which matches the AZ-104 exam's Bastion scope. Since this content was written, Microsoft added two more tiers: <strong>Developer</strong> (free, shared infrastructure, single-VM support, dev/test only) below Basic, and <strong>Premium</strong> (adds session recording and private-only deployment) above Standard. This is additive, not a correction to what's listed — the Basic/Standard facts above remain accurate.</p>
</div>
</div><h3 id="configure-service-endpoints-azure-services">2.3 Configure Service Endpoints for Azure Services</h3><h4>Commonly Used Service Endpoints</h4><ul>
<li>Microsoft.Storage</li>
<li>Microsoft.Sql</li>
<li>Microsoft.KeyVault</li>
<li>Microsoft.EventHub</li>
<li>Microsoft.ServiceBus</li>
<li>Microsoft.ContainerRegistry</li>
<li>Microsoft.CognitiveServices</li>
</ul><pre><code># Enable multiple service endpoints
az network vnet subnet update \\
  --resource-group myResourceGroup \\
  --vnet-name myVNet \\
  --name mySubnet \\
  --service-endpoints \\
    Microsoft.Storage \\
    Microsoft.Sql \\
    Microsoft.KeyVault

# Configure SQL Server to allow VNet
az sql server vnet-rule create \\
  --resource-group myResourceGroup \\
  --server myserver \\
  --name AllowSubnet \\
  --vnet-name myVNet \\
  --subnet mySubnet</code></pre>` },
        { id: "nw-name-resolution-lb", label: "Configure Name Resolution and Load Balancing",
          content: `<h3 id="configure-azure-dns">3.1 Configure Azure DNS</h3><h4>Azure DNS Features</h4><ul>
<li>Host DNS domains in Azure</li>
<li>Use Azure infrastructure for name resolution</li>
<li>Supports A, AAAA, CNAME, MX, TXT, SRV, etc.</li>
<li>Private DNS zones for internal resolution</li>
</ul><pre><code># Create public DNS zone
az network dns zone create \\
  --resource-group myResourceGroup \\
  --name contoso.com

# Add A record
az network dns record-set a add-record \\
  --resource-group myResourceGroup \\
  --zone-name contoso.com \\
  --record-set-name www \\
  --ipv4-address 203.0.113.10

# Add CNAME record
az network dns record-set cname set-record \\
  --resource-group myResourceGroup \\
  --zone-name contoso.com \\
  --record-set-name blog \\
  --cname www.contoso.com

# List name servers (update domain registrar)
az network dns zone show \\
  --resource-group myResourceGroup \\
  --name contoso.com \\
  --query nameServers</code></pre><h3 id="configure-private-dns-zones">3.2 Configure Private DNS Zones</h3><h4>Private DNS Features</h4><ul>
<li>Name resolution within VNets</li>
<li>No need for custom DNS solution</li>
<li>Automatic VM registration (optional)</li>
<li>Split-brain DNS (different internal/external names)</li>
</ul><pre><code># Create private DNS zone
az network private-dns zone create \\
  --resource-group myResourceGroup \\
  --name contoso.internal

# Link to VNet with auto-registration
az network private-dns link vnet create \\
  --resource-group myResourceGroup \\
  --zone-name contoso.internal \\
  --name myDNSLink \\
  --virtual-network myVNet \\
  --registration-enabled true

# Add A record manually
az network private-dns record-set a add-record \\
  --resource-group myResourceGroup \\
  --zone-name contoso.internal \\
  --record-set-name db \\
  --ipv4-address 10.0.2.10

# Query from VM in VNet
# nslookup db.contoso.internal
# Returns: 10.0.2.10</code></pre><h3 id="configure-azure-load-balancer">3.3 Configure Azure Load Balancer</h3><h4>Load Balancer SKUs</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Feature</th><th>Basic</th><th>Standard</th></tr>
</thead>
<tbody>
<tr><td><strong>Backend Pool</strong></td><td>Up to 300 VMs</td><td>Up to 1000 VMs</td></tr>
<tr><td><strong>Health Probes</strong></td><td>HTTP, TCP</td><td>HTTP, HTTPS, TCP</td></tr>
<tr><td><strong>Availability Zones</strong></td><td>Not supported</td><td>Zone-redundant, zonal</td></tr>
<tr><td><strong>SLA</strong></td><td>None</td><td>99.99%</td></tr>
<tr><td><strong>Secure by Default</strong></td><td>No</td><td>Yes (requires NSG)</td></tr>
<tr><td><strong>Cost</strong></td><td>Free</td><td>Charges apply</td></tr>
</tbody>
</table>
</div><h4>Load Balancer Types</h4><ul>
<li><strong>Public</strong>: Distribute internet traffic to VMs</li>
<li><strong>Internal</strong>: Distribute traffic within VNet</li>
</ul><pre><code># Create public load balancer
az network lb create \\
  --resource-group myResourceGroup \\
  --name myLoadBalancer \\
  --sku Standard \\
  --public-ip-address myPublicIP \\
  --frontend-ip-name myFrontEnd \\
  --backend-pool-name myBackEndPool

# Create health probe
az network lb probe create \\
  --resource-group myResourceGroup \\
  --lb-name myLoadBalancer \\
  --name myHealthProbe \\
  --protocol HTTP \\
  --port 80 \\
  --path /

# Create load balancing rule
az network lb rule create \\
  --resource-group myResourceGroup \\
  --lb-name myLoadBalancer \\
  --name myLBRule \\
  --protocol TCP \\
  --frontend-port 80 \\
  --backend-port 80 \\
  --frontend-ip-name myFrontEnd \\
  --backend-pool-name myBackEndPool \\
  --probe-name myHealthProbe

# Add VMs to backend pool
az network nic ip-config address-pool add \\
  --resource-group myResourceGroup \\
  --nic-name myNIC \\
  --ip-config-name ipconfig1 \\
  --lb-name myLoadBalancer \\
  --address-pool myBackEndPool</code></pre><h4>Load Balancer Rules</h4><ul>
<li><strong>Load Balancing Rule</strong>: Distribute traffic across backend pool</li>
<li><strong>Inbound NAT Rule</strong>: Forward traffic to specific VM</li>
<li><strong>Outbound Rule</strong>: Configure outbound connectivity</li>
</ul><h4>Distribution Modes</h4><ul>
<li><strong>5-tuple hash</strong> (default): Source IP, source port, destination IP, destination port, protocol</li>
<li><strong>Source IP affinity (2-tuple)</strong>: Source IP, destination IP</li>
<li><strong>Source IP affinity (3-tuple)</strong>: Source IP, destination IP, protocol</li>
</ul><pre><code># Create inbound NAT rule (RDP to specific VM)
az network lb inbound-nat-rule create \\
  --resource-group myResourceGroup \\
  --lb-name myLoadBalancer \\
  --name myNATRule-VM1 \\
  --protocol TCP \\
  --frontend-port 3389 \\
  --backend-port 3389 \\
  --frontend-ip-name myFrontEnd

# Associate NAT rule with NIC
az network nic ip-config inbound-nat-rule add \\
  --resource-group myResourceGroup \\
  --nic-name myNIC1 \\
  --ip-config-name ipconfig1 \\
  --inbound-nat-rule myNATRule-VM1 \\
  --lb-name myLoadBalancer</code></pre><h3 id="troubleshoot-load-balancing">3.4 Troubleshoot Load Balancing</h3><h4>Common Issues</h4><ul>
<li>Health probe failures</li>
<li>NSG blocking traffic</li>
<li>Incorrect backend pool configuration</li>
<li>Asymmetric routing</li>
</ul><pre><code># Check backend health
az network lb show \\
  --resource-group myResourceGroup \\
  --name myLoadBalancer

# View effective NSG rules on backend VMs
az network nic list-effective-nsg \\
  --resource-group myResourceGroup \\
  --name myNIC

# Test connectivity from load balancer
az network watcher test-connectivity \\
  --resource-group myResourceGroup \\
  --source-resource myVM \\
  --dest-address &lt;backend-vm-ip&gt; \\
  --dest-port 80</code></pre><h4>Health Probe Troubleshooting</h4><ul>
<li>Verify probe path returns HTTP 200</li>
<li>Check probe interval and unhealthy threshold</li>
<li>Ensure NSG allows health probe traffic (AzureLoadBalancer service tag)</li>
<li>Verify application is listening on probe port</li>
</ul>` },
      ]},
      { id: "monitoring", title: "05 · Monitoring (10-15%)", color: "var(--c-pink)", items: [
        { id: "mo-monitor-resources", label: "Monitor Resources Using Azure Monitor", type: "recommended",
          content: `<h3 id="configure-interpret-metrics">1.1 Configure and Interpret Metrics</h3><h4>Azure Monitor Metrics</h4><ul>
<li>Time-series data collected automatically</li>
<li>Near real-time (1-minute granularity)</li>
<li>Retained for 93 days</li>
<li>Dimensional metrics (filter by instance, disk, etc.)</li>
</ul><p><strong>Common Metrics</strong>:</p><ul>
<li>VM: CPU percentage, disk IOPS, network bytes</li>
<li>Storage: Transactions, ingress, egress</li>
<li>App Service: HTTP requests, response time</li>
<li>SQL Database: DTU percentage, deadlocks</li>
</ul><pre><code># List available metrics for a resource
az monitor metrics list-definitions \\
  --resource /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/myVM

# Get metric values
az monitor metrics list \\
  --resource /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/myVM \\
  --metric "Percentage CPU" \\
  --start-time 2025-11-26T00:00:00Z \\
  --end-time 2025-11-26T23:59:59Z \\
  --interval PT1M</code></pre><h4>Metrics Explorer (Portal)</h4><ul>
<li>Visualize metrics with charts</li>
<li>Multiple resources on same chart</li>
<li>Split by dimension (e.g., per disk)</li>
<li>Pin charts to dashboards</li>
<li>Share charts</li>
</ul><h3 id="configure-logs">1.2 Configure Logs</h3><h4>Azure Monitor Logs</h4><ul>
<li>Log data stored in Log Analytics workspace</li>
<li>Query with Kusto Query Language (KQL)</li>
<li>Data retention: 30-730 days (configurable)</li>
<li>Collect from VMs, containers, applications, Azure resources</li>
</ul><pre><code># Create Log Analytics workspace
az monitor log-analytics workspace create \\
  --resource-group myResourceGroup \\
  --workspace-name myWorkspace \\
  --location eastus

# Enable VM insights (install agents)
az vm extension set \\
  --resource-group myResourceGroup \\
  --vm-name myVM \\
  --name AzureMonitorLinuxAgent \\
  --publisher Microsoft.Azure.Monitor \\
  --enable-auto-upgrade true

# Configure data collection for Windows VM
az vm extension set \\
  --resource-group myResourceGroup \\
  --vm-name myWindowsVM \\
  --name AzureMonitorWindowsAgent \\
  --publisher Microsoft.Azure.Monitor</code></pre><h4>Common Log Tables</h4><ul>
<li><strong>Event</strong>: Windows event logs</li>
<li><strong>Syslog</strong>: Linux syslog</li>
<li><strong>Perf</strong>: Performance counters</li>
<li><strong>Heartbeat</strong>: VM availability</li>
<li><strong>AzureActivity</strong>: Azure activity log</li>
<li><strong>AzureMetrics</strong>: Platform metrics</li>
<li><strong>ContainerLog</strong>: Container logs</li>
</ul><h3 id="query-analyze-logs">1.3 Query and Analyze Logs</h3><h4>Kusto Query Language (KQL) Examples</h4><pre><code>// Get all events from last 24 hours
Event
| where TimeGenerated &gt; ago(24h)
| summarize count() by EventLevelName

// CPU usage by computer
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where TimeGenerated &gt; ago(1h)
| summarize avg(CounterValue) by Computer
| render timechart

// VM heartbeats (availability)
Heartbeat
| where TimeGenerated &gt; ago(24h)
| summarize count() by Computer
| where count_ &lt; 1440  // Less than expected heartbeats

// Failed sign-ins
SigninLogs
| where TimeGenerated &gt; ago(7d)
| where ResultType != "0"
| summarize FailedSignins=count() by UserPrincipalName
| order by FailedSignins desc

// Storage account transactions
StorageBlobLogs
| where TimeGenerated &gt; ago(1h)
| where StatusCode &gt;= 400
| summarize count() by StatusCode, OperationName

// Application exceptions
AppExceptions
| where TimeGenerated &gt; ago(24h)
| summarize count() by ProblemId
| order by count_ desc</code></pre><h4>KQL Operators</h4><ul>
<li><strong>where</strong>: Filter rows</li>
<li><strong>summarize</strong>: Aggregate data</li>
<li><strong>project</strong>: Select columns</li>
<li><strong>extend</strong>: Add calculated columns</li>
<li><strong>join</strong>: Combine tables</li>
<li><strong>render</strong>: Visualize results (timechart, piechart, barchart)</li>
</ul><h3 id="setup-alerts-actions">1.4 Set Up Alerts and Actions</h3><h4>Alert Types</h4><ol>
<li><strong>Metric Alerts</strong>: Based on metric values (CPU &gt; 80%)</li>
<li><strong>Log Alerts</strong>: Based on log query results</li>
<li><strong>Activity Log Alerts</strong>: Based on Azure activity (VM deleted)</li>
<li><strong>Smart Detection Alerts</strong>: Application Insights anomalies</li>
</ol><pre><code># Create action group (email notification)
az monitor action-group create \\
  --resource-group myResourceGroup \\
  --name myActionGroup \\
  --short-name myAG \\
  --email-receiver name=AdminEmail address=admin@contoso.com

# Create metric alert (CPU &gt; 80%)
az monitor metrics alert create \\
  --resource-group myResourceGroup \\
  --name HighCPUAlert \\
  --scopes /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/myVM \\
  --condition "avg Percentage CPU &gt; 80" \\
  --window-size 5m \\
  --evaluation-frequency 1m \\
  --action myActionGroup \\
  --description "Alert when CPU exceeds 80%"

# Create log query alert
az monitor scheduled-query create \\
  --resource-group myResourceGroup \\
  --name FailedSignInAlert \\
  --scopes /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.OperationalInsights/workspaces/myWorkspace \\
  --condition "count &gt; 5" \\
  --condition-query "SigninLogs | where ResultType != '0' | summarize count()" \\
  --evaluation-frequency 5m \\
  --window-size 15m \\
  --action myActionGroup

# Create activity log alert (VM deletion)
az monitor activity-log alert create \\
  --resource-group myResourceGroup \\
  --name VMDeletionAlert \\
  --scopes /subscriptions/&lt;sub-id&gt; \\
  --condition category=Administrative and operationName=Microsoft.Compute/virtualMachines/delete \\
  --action myActionGroup</code></pre><h4>Action Groups</h4><ul>
<li><strong>Email</strong>: Send email notification</li>
<li><strong>SMS</strong>: Send text message</li>
<li><strong>Push</strong>: Azure mobile app notification</li>
<li><strong>Voice</strong>: Phone call</li>
<li><strong>Webhook</strong>: HTTP POST to URL</li>
<li><strong>Logic App</strong>: Trigger Logic App workflow</li>
<li><strong>Automation Runbook</strong>: Run automation script</li>
<li><strong>Azure Function</strong>: Execute function</li>
<li><strong>ITSM</strong>: Create ITSM ticket</li>
</ul><h3 id="configure-application-insights">1.5 Configure Application Insights</h3><h4>Application Insights Features</h4><ul>
<li>Application performance monitoring (APM)</li>
<li>Request rates, response times, failure rates</li>
<li>Dependency tracking (SQL, HTTP calls)</li>
<li>Exception tracking</li>
<li>Custom events and metrics</li>
<li>Live metrics stream</li>
</ul><pre><code># Create Application Insights
az monitor app-insights component create \\
  --resource-group myResourceGroup \\
  --app myAppInsights \\
  --location eastus \\
  --workspace /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.OperationalInsights/workspaces/myWorkspace

# Get instrumentation key
az monitor app-insights component show \\
  --resource-group myResourceGroup \\
  --app myAppInsights \\
  --query instrumentationKey

# Configure App Service to use Application Insights
az webapp config appsettings set \\
  --resource-group myResourceGroup \\
  --name myWebApp \\
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=&lt;instrumentation-key&gt;</code></pre><h4>Application Insights Telemetry</h4><ul>
<li><strong>Requests</strong>: HTTP requests</li>
<li><strong>Dependencies</strong>: External calls (SQL, Redis, HTTP)</li>
<li><strong>Exceptions</strong>: Unhandled exceptions</li>
<li><strong>Page Views</strong>: Client-side page loads</li>
<li><strong>Custom Events</strong>: Your custom telemetry</li>
<li><strong>Traces</strong>: Diagnostic logs</li>
</ul><h3 id="configure-monitoring-vms">1.6 Configure Monitoring for VMs</h3><h4>VM Insights</h4><ul>
<li>Performance monitoring</li>
<li>Process and dependency mapping</li>
<li>Standardized monitoring</li>
<li>Automatic agent installation</li>
</ul><pre><code># Enable VM Insights
az vm extension set \\
  --resource-group myResourceGroup \\
  --vm-name myVM \\
  --name AzureMonitorLinuxAgent \\
  --publisher Microsoft.Azure.Monitor

# Create data collection rule
az monitor data-collection rule create \\
  --resource-group myResourceGroup \\
  --name myDCR \\
  --location eastus \\
  --rule-file dcr.json

# Associate DCR with VM
az monitor data-collection rule association create \\
  --name myDCR-association \\
  --rule-id /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Insights/dataCollectionRules/myDCR \\
  --resource /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/myVM</code></pre><h4>Guest OS Diagnostics</h4><ul>
<li>Windows: Performance counters, event logs, IIS logs</li>
<li>Linux: Syslog, performance counters</li>
</ul><h3 id="configure-monitoring-storage">1.7 Configure Monitoring for Storage Accounts</h3><h4>Storage Insights</h4><ul>
<li>Capacity trends</li>
<li>Transaction analysis</li>
<li>Availability monitoring</li>
<li>Latency metrics</li>
</ul><pre><code># Enable Storage Analytics logging
az storage logging update \\
  --account-name mystorageaccount \\
  --services b \\
  --log rwd \\
  --retention 7

# Enable metrics
az storage metrics update \\
  --account-name mystorageaccount \\
  --services b \\
  --hour true \\
  --minute true \\
  --retention 7

# Create diagnostic setting (send logs to Log Analytics)
az monitor diagnostic-settings create \\
  --resource /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Storage/storageAccounts/mystorageaccount \\
  --name myDiagnostics \\
  --workspace /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.OperationalInsights/workspaces/myWorkspace \\
  --logs '[{"category": "StorageRead", "enabled": true}, {"category": "StorageWrite", "enabled": true}, {"category": "StorageDelete", "enabled": true}]' \\
  --metrics '[{"category": "Transaction", "enabled": true}]'</code></pre><h3 id="configure-monitoring-networks">1.8 Configure Monitoring for Networks</h3><h4>Network Watcher</h4><ul>
<li>Connection monitor</li>
<li>Packet capture</li>
<li>IP flow verify</li>
<li>NSG flow logs</li>
<li>Traffic analytics</li>
</ul><pre><code># Enable NSG flow logs
az network watcher flow-log create \\
  --location eastus \\
  --name myFlowLog \\
  --nsg /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Network/networkSecurityGroups/myNSG \\
  --storage-account /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Storage/storageAccounts/flowlogsstorage \\
  --workspace /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.OperationalInsights/workspaces/myWorkspace \\
  --enabled true \\
  --format JSON \\
  --log-version 2 \\
  --retention 7 \\
  --traffic-analytics true

# Create connection monitor
az network watcher connection-monitor create \\
  --resource-group myResourceGroup \\
  --name myConnectionMonitor \\
  --location eastus \\
  --endpoints \\
    source-vm='{"name":"source","resourceId":"/subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/sourceVM"}' \\
    destination-vm='{"name":"destination","resourceId":"/subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/destVM"}'</code></pre><h4>Traffic Analytics</h4><ul>
<li>Network traffic patterns</li>
<li>Top talkers</li>
<li>Geo-location mapping</li>
<li>Security threat detection</li>
<li>Requires NSG flow logs</li>
</ul>` },
        { id: "mo-backup-recovery", label: "Implement Backup and Recovery", type: "recommended",
          content: `<h3 id="create-recovery-services-vault">2.1 Create Recovery Services Vault</h3><h4>Recovery Services Vault</h4><ul>
<li>Store backup data</li>
<li>Store Site Recovery configuration</li>
<li>Geo-redundant storage (GRS) by default</li>
<li>Supports soft delete (14-day retention)</li>
</ul><pre><code># Create Recovery Services vault
az backup vault create \\
  --resource-group myResourceGroup \\
  --name myRecoveryServicesVault \\
  --location eastus

# Configure vault backup properties
az backup vault backup-properties set \\
  --resource-group myResourceGroup \\
  --name myRecoveryServicesVault \\
  --soft-delete-feature-state Enable

# Change storage redundancy (must be done before any backups)
az backup vault backup-properties set \\
  --resource-group myResourceGroup \\
  --name myRecoveryServicesVault \\
  --backup-storage-redundancy GeoRedundant</code></pre><h4>Storage Redundancy Options</h4><div class="table-wrap">
<table>
<thead>
<tr><th>Option</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td><strong>Locally Redundant Storage (LRS)</strong></td><td>3 copies in same datacenter</td></tr>
<tr><td><strong>Geo-Redundant Storage (GRS)</strong></td><td>6 copies across two regions</td></tr>
<tr><td><strong>Zone-Redundant Storage (ZRS)</strong></td><td>3 copies across availability zones</td></tr>
</tbody>
</table>
</div><h3 id="create-azure-backup-vault">2.2 Create Azure Backup Vault</h3><h4>Backup Vault vs. Recovery Services Vault</h4><ul>
<li><strong>Recovery Services Vault</strong>: VMs, SQL, SAP HANA, Azure Files</li>
<li><strong>Backup Vault</strong>: Newer workloads (PostgreSQL, Blobs, Disks)</li>
</ul><pre><code># Create Backup vault
az dataprotection backup-vault create \\
  --resource-group myResourceGroup \\
  --vault-name myBackupVault \\
  --location eastus \\
  --storage-settings datastore-type=VaultStore type=GeoRedundant</code></pre><h3 id="create-configure-backup-policy">2.3 Create and Configure Backup Policy</h3><h4>Backup Policies</h4><ul>
<li>Define backup schedule</li>
<li>Define retention rules</li>
<li>Different policies for different workloads</li>
</ul><pre><code># Create VM backup policy
az backup policy create \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --name DailyBackupPolicy \\
  --backup-management-type AzureIaasVM \\
  --policy '{
    "schedulePolicy": {
      "schedulePolicyType": "SimpleSchedulePolicy",
      "scheduleRunFrequency": "Daily",
      "scheduleRunTimes": ["2025-11-26T02:00:00Z"]
    },
    "retentionPolicy": {
      "retentionPolicyType": "LongTermRetentionPolicy",
      "dailySchedule": {
        "retentionTimes": ["2025-11-26T02:00:00Z"],
        "retentionDuration": {
          "count": 30,
          "durationType": "Days"
        }
      },
      "weeklySchedule": {
        "daysOfTheWeek": ["Sunday"],
        "retentionTimes": ["2025-11-26T02:00:00Z"],
        "retentionDuration": {
          "count": 12,
          "durationType": "Weeks"
        }
      },
      "monthlySchedule": {
        "retentionScheduleFormatType": "Weekly",
        "retentionScheduleWeekly": {
          "daysOfTheWeek": ["Sunday"],
          "weeksOfTheMonth": ["First"]
        },
        "retentionTimes": ["2025-11-26T02:00:00Z"],
        "retentionDuration": {
          "count": 12,
          "durationType": "Months"
        }
      }
    }
  }'

# List backup policies
az backup policy list \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault</code></pre><h3 id="configure-vm-backups">2.4 Configure VM Backups</h3><pre><code># Enable backup for VM
az backup protection enable-for-vm \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --vm myVM \\
  --policy-name DailyBackupPolicy

# Trigger immediate backup
az backup protection backup-now \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --container-name myVM \\
  --item-name myVM \\
  --retain-until 31-12-2025

# List backup jobs
az backup job list \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --output table

# Check backup status
az backup protection check-vm \\
  --resource-group myResourceGroup \\
  --vm-id /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.Compute/virtualMachines/myVM</code></pre><h4>VM Backup Features</h4><ul>
<li>Application-consistent snapshots (VSS/FSFreeze)</li>
<li>Incremental backups (only changed blocks)</li>
<li>Instant restore (from snapshots, 2-5 days)</li>
<li>Cross-region restore (with GRS)</li>
<li>Selective disk backup</li>
</ul><h3 id="configure-files-blob-backups">2.5 Configure Azure Files and Blob Backups</h3><h4>Azure Files Backup</h4><pre><code># Enable backup for file share
az backup protection enable-for-azurefileshare \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --storage-account mystorageaccount \\
  --azure-file-share myfileshare \\
  --policy-name DefaultPolicy

# Restore file share
az backup restore restore-azurefileshare \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --container-name mystorageaccount \\
  --item-name myfileshare \\
  --rp-name &lt;recovery-point-name&gt; \\
  --restore-mode AlternateLocation \\
  --target-storage-account targetstorageaccount \\
  --target-file-share targetshare</code></pre><h4>Blob Backup (Operational Backup)</h4><ul>
<li>Continuous backup (not scheduled)</li>
<li>Point-in-time restore</li>
<li>Protects against accidental deletion or corruption</li>
<li>Data never leaves source storage account</li>
</ul><pre><code># Configure blob backup policy
az dataprotection backup-policy create \\
  --resource-group myResourceGroup \\
  --vault-name myBackupVault \\
  --name BlobBackupPolicy \\
  --policy blob-policy.json

# Enable blob backup
az dataprotection backup-instance create \\
  --resource-group myResourceGroup \\
  --vault-name myBackupVault \\
  --backup-instance blob-backup-instance.json</code></pre><h3 id="perform-restore-operations">2.6 Perform Restore Operations</h3><h4>VM Restore Options</h4><ol>
<li><strong>Create new VM</strong>: New VM from recovery point</li>
<li><strong>Replace existing disk</strong>: Replace VM's disks</li>
<li><strong>Restore disk</strong>: Restore disk only (create VM manually)</li>
<li><strong>File recovery</strong>: Mount recovery point, copy specific files</li>
</ol><pre><code># Restore VM (create new)
az backup restore restore-disks \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --container-name myVM \\
  --item-name myVM \\
  --rp-name &lt;recovery-point-name&gt; \\
  --storage-account mystorageaccount \\
  --restore-to-staging-storage-account

# After disks are restored, create VM from disk
# Use Portal or PowerShell to create VM from restored VHD</code></pre><h4>File-Level Recovery</h4><pre><code># Download script to mount recovery point
az backup restore files mount-rp \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --container-name myVM \\
  --item-name myVM \\
  --rp-name &lt;recovery-point-name&gt;

# Run the downloaded script on a recovery VM
# Copy files as needed
# Unmount when done
az backup restore files unmount-rp \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --container-name myVM \\
  --item-name myVM \\
  --rp-name &lt;recovery-point-name&gt;</code></pre><h3 id="configure-site-recovery">2.7 Configure Azure Site Recovery</h3><h4>Site Recovery Scenarios</h4><ul>
<li><strong>Azure to Azure</strong>: Replicate Azure VMs to another region</li>
<li><strong>On-premises to Azure</strong>: VMware, Hyper-V, physical servers</li>
<li><strong>Azure to on-premises</strong>: Not supported (use backup)</li>
</ul><pre><code># Create Recovery Services vault for Site Recovery
az backup vault create \\
  --resource-group myResourceGroup \\
  --name mySiteRecoveryVault \\
  --location eastus

# Enable replication for Azure VM (typically done via Portal)
# Portal &gt; Recovery Services Vault &gt; Site Recovery &gt; Enable Replication

# Perform test failover
az site-recovery test-failover \\
  --resource-group myResourceGroup \\
  --vault-name mySiteRecoveryVault \\
  --name myVM

# Perform actual failover
az site-recovery failover \\
  --resource-group myResourceGroup \\
  --vault-name mySiteRecoveryVault \\
  --name myVM</code></pre><h4>Site Recovery Components</h4><ul>
<li><strong>Protection Policy</strong>: RPO, retention, crash-consistent/app-consistent snapshots</li>
<li><strong>Recovery Plan</strong>: Group VMs, define failover order, add scripts</li>
<li><strong>Replication Policy</strong>: Snapshot frequency, recovery points</li>
<li><strong>Test Failover</strong>: Validate DR without affecting production</li>
</ul><h4>Failover Process</h4><ol>
<li><strong>Test Failover</strong>: Validate DR configuration (isolated network)</li>
<li><strong>Planned Failover</strong>: Graceful shutdown, replicate final changes</li>
<li><strong>Unplanned Failover</strong>: Emergency failover (data loss possible)</li>
<li><strong>Commit</strong>: Accept failover, delete source VM</li>
<li><strong>Reprotect</strong>: Reverse replication direction</li>
<li><strong>Failback</strong>: Return to original location</li>
</ol><h3 id="monitor-backup-site-recovery">2.8 Monitor Backup and Site Recovery</h3><pre><code># View backup reports
az backup protection check-vm \\
  --resource-group myResourceGroup \\
  --vm-id &lt;vm-resource-id&gt;

# List recovery points
az backup recoverypoint list \\
  --resource-group myResourceGroup \\
  --vault-name myRecoveryServicesVault \\
  --container-name myVM \\
  --item-name myVM \\
  --output table

# Configure backup alerts
az monitor metrics alert create \\
  --resource-group myResourceGroup \\
  --name BackupFailureAlert \\
  --scopes /subscriptions/&lt;sub-id&gt;/resourceGroups/&lt;rg&gt;/providers/Microsoft.RecoveryServices/vaults/myRecoveryServicesVault \\
  --condition "count BackupHealthEvent &gt; 0" \\
  --window-size 1h \\
  --evaluation-frequency 30m \\
  --action myActionGroup</code></pre><h4>Backup Reports</h4><ul>
<li>Built-in Power BI reports</li>
<li>Backup health</li>
<li>Job success/failure rates</li>
<li>Storage consumption trends</li>
<li>Policy compliance</li>
</ul>` },
      ]},
    ],
};
