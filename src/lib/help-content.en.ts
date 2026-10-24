import type { PageHelp } from "./help-content";

/** English version of the in-app page guides - same structure and keys as HELP_CONTENT (Arabic) */
export const HELP_CONTENT_EN: Record<string, PageHelp> = {
  "/": {
    title: "Dashboard",
    icon: "dashboard",
    summary:
      "The dashboard gives you a quick picture of the whole company: revenue, expenses and net profit, what you are owed and what you owe, ongoing projects, stock running low, and the latest treasury transactions.",
    sections: [
      {
        title: "Reading the key indicators (KPIs)",
        icon: "monitoring",
        intro: "The cards at the top summarize the important numbers:",
        steps: [
          "Contract value: the total value of all project contracts.",
          "Revenue: all payments collected from clients (cancelled checks are not counted).",
          "Expenses: cost of issued materials + petty expenses + labor + custodies (mission and side custodies) linked to projects.",
          "Net profit: revenue minus expenses. The small percentage next to each number compares this month with the previous one.",
        ],
      },
      {
        title: "Filtering by date",
        icon: "date_range",
        steps: [
          "Pick \"From date\" and \"To date\" in the date filter at the top.",
          "Revenue, expenses and the chart are calculated for that period only.",
          "The treasury balance and receivables/payables are live figures, so they don't change with the filter.",
        ],
      },
      {
        title: "Alerts and follow-up",
        icon: "notifications_active",
        steps: [
          "\"Inventory health\" lists materials at or below their minimum level. Click a material to open it and record a purchase.",
          "\"Receivables\" shows what clients owe you and what you owe suppliers, with the largest client/supplier.",
          "\"Ongoing projects\" shows each project's value, amount collected, actual cost and net profit.",
          "The notifications bell at the top collects smart alerts (checks due, low stock, projects behind on collection...).",
        ],
      },
    ],
    faqs: [
      { q: "Why is net profit here different from the sum of project profits?", a: "Dashboard net profit = money actually collected minus expenses, while project profit = contract value minus its cost. The dashboard is based on money that actually came in." },
      { q: "A number didn't update after I recorded a transaction?", a: "Refresh the page (F5). All figures are calculated live from the recorded data." },
      { q: "Are missions and custodies included in expenses?", a: "Yes. Any mission custody or side custody linked to a project is counted in its expenses: at its full amount until settled, then at the actual amount spent." },
    ],
  },

  "/projects": {
    title: "Projects",
    icon: "account_tree",
    summary:
      "Manage each project from creation to closing: client payments, issued materials, petty expenses, custodies and missions, work deductions, attachments and the audit log. Everything is reflected automatically in the project's net profit and in the treasury.",
    sections: [
      {
        title: "Creating a new project",
        icon: "add_circle",
        steps: [
          "Click \"New project\" and pick the client (if it doesn't exist, add it first from the Clients page).",
          "Choose the project type: Manufacturing & execution (tender) / Subcontracting / Supply.",
          "Enter the contract value. For tenders: enter the bid bond, tax and work guarantee percentages and their due dates.",
          "Save - the project gets an automatic code (KMG-Year-Number), and the bid bond and guarantee are recorded as an expense and a treasury outflow.",
        ],
        notes: ["Tax is not an expense - it is added to the contract value to be collected from the client (total incl. tax)."],
      },
      {
        title: "The \"Overview\" tab - project summary",
        icon: "summarize",
        steps: [
          "At the top: contract value, collected, remaining, and net profit.",
          "\"Budget variance\": the share of the contract value spent so far, with the cost breakdown (materials / petty / labor / custodies).",
          "\"Materials issued to the project\": each material with the same name and price as in the Materials tab, the net quantity and the total (quantity × price), with the total materials cost at the end.",
          "Bid bond and work guarantee cards: when the money comes back, click \"Recovered\" and it is added to the treasury.",
        ],
      },
      {
        title: "Recording a client payment",
        icon: "payments",
        steps: [
          "In the \"Payments\" tab click \"Record payment\".",
          "Enter the amount split into cash/credit, or mark it as a check and set its due date.",
          "Cash/credit payments go into the treasury immediately. A check counts toward the project right away, but only enters the treasury once you settle it as \"Cleared\".",
        ],
        notes: [
          "Any cleared check is posted to the treasury's credit balance, not cash.",
          "A cancelled check is not counted as collected on the project.",
        ],
      },
      {
        title: "Issuing materials to the project (and editing them)",
        icon: "inventory_2",
        steps: [
          "In the \"Materials\" tab click \"Issue material\" and choose the material, the price batch and the quantity.",
          "If some quantity came back from the site, click \"Return\".",
          "The table shows each movement with quantity, price and total (quantity × price), and the last row holds the grand total.",
          "If you have the Manage Stock permission, you can edit or delete any wrong issue/return from the action buttons - the cost is recalculated automatically.",
        ],
      },
      {
        title: "Expenses and custodies",
        icon: "receipt_long",
        intro: "The \"Expenses & custodies\" tab gathers everything spent on the project in one table:",
        steps: [
          "Petty expense: click \"New expense\", choose the category and amount, and whether it is deducted from the treasury immediately.",
          "Issue a custody: click \"Issue custody\", choose the employee and amount (cash/credit) - the custody is linked to the project automatically and deducted from the treasury.",
          "Mission custodies appear here automatically from the Missions tab.",
          "When the employee comes back with receipts, click \"Settle\" on the custody and enter the actual amount spent - the difference goes back to the treasury or is paid to the employee automatically.",
          "The cards at the top show the total of each type - click a card to filter the table by it.",
        ],
        notes: [
          "A custody counts against the project at its full amount from the moment it is issued, and at the actual amount spent after settlement.",
          "A custody issued from the Treasury page and linked to a project also appears here, and you can settle it from here or from the treasury.",
        ],
      },
      {
        title: "Missions",
        icon: "engineering",
        steps: [
          "In the \"Missions\" tab click \"New mission\", choose the foreman, the workers, each worker's number of days and the advance amount.",
          "The advance is deducted from the treasury immediately and appears in the project's expenses.",
          "Each worker on a mission has a mission daily rate (double their daily wage by default, and you can change it), and days can be fractional (e.g. 3.5) - it counts toward labor cost and payroll.",
          "At the end of the mission click \"Settle\" and enter the actual amount spent: if it is less than the advance, the rest goes back to the treasury; if it is more, the extra is recorded as a petty expense \"Custody settlement difference\".",
        ],
      },
      {
        title: "Work deductions, attachments and the audit log",
        icon: "history",
        steps: [
          "Project work deductions: if the client deducted part of the amount due (penalty/settlement), record it here so the remaining balance is correct.",
          "Attachments: upload contracts, progress invoices and photos for the project.",
          "Audit log: every change made to the project (who and when) is recorded automatically.",
          "The \"Export\" button at the top produces a complete Excel file with all project data.",
        ],
      },
    ],
    faqs: [
      { q: "I recorded a wrong payment or expense, what do I do?", a: "Click the edit icon next to the row and correct the amount, or delete it. Its treasury effect is reversed and re-recorded with the correct amount automatically." },
      { q: "How is net profit calculated?", a: "Contract value minus (materials cost + petty expenses + labor + custodies). Materials = issued minus returned, each movement at its price when issued." },
      { q: "I issued a custody from the treasury and forgot to link it to the project?", a: "Open the custody from the \"Side custodies\" tab in the treasury, click edit and choose the project - it will show up in its expenses immediately." },
      { q: "I can't delete the project?", a: "Only an empty project can be deleted. First delete its payments, expenses, custodies, missions, material movements and attachments." },
      { q: "A check was postponed?", a: "In the Payments tab click \"Settle\" on the check, choose \"Postpone\" and set the new date." },
      { q: "Does tax affect the treasury?", a: "No, tax only increases the amount to be collected from the client. What affects the treasury is the payments actually collected." },
    ],
  },

  "/stock": {
    title: "Inventory",
    icon: "inventory_2",
    summary:
      "Complete materials management: add, edit, delete and merge materials, purchase from suppliers, issue to projects, returns, and stock-count adjustments. Any recording mistake can be fixed at any time, and the balance, project costs, supplier balances and treasury are adjusted automatically.",
    sections: [
      {
        title: "Adding a new material",
        icon: "add_box",
        steps: [
          "Click \"New material\".",
          "Enter the name, unit (meter, sheet, box...), unit price and the minimum alert level.",
          "If you already have the material in stock, enter the \"Opening balance\".",
          "Choose the type (optional) and fill in its extra fields (size, color, thickness...).",
        ],
        notes: ["The minimum level makes the material appear in the \"Low stock\" alert on the dashboard when the balance reaches it."],
      },
      {
        title: "Editing a material's name, details or extra fields",
        icon: "edit",
        steps: [
          "In the items table click the pencil icon next to the material, or open the material and click \"Edit details\".",
          "Change the name, unit, minimum level, type or the extra field values.",
          "This only changes how it is displayed - recorded movements and costs are not affected.",
        ],
      },
      {
        title: "Stock types and extra fields",
        icon: "category",
        steps: [
          "Click \"Manage types\" then \"New type\", and enter its name.",
          "Click \"Add field\" for each extra field: the key (in English, e.g. size), the display name (Size) and its type (text/number).",
          "You can later rename any field's display name, or delete a field - its value is removed from all items of that type.",
          "Deleting a whole type doesn't delete its items - they move to \"No type\".",
        ],
      },
      {
        title: "Purchasing from a supplier",
        icon: "shopping_cart",
        steps: [
          "Click \"Purchase\", choose the material and supplier, and enter the quantity and unit price.",
          "If there is a transport cost, enter it in \"Transport cost\" - it is added to what you owe the supplier (material + transport = the amount you write on the check or transfer), and recorded separately so you know the material's cost including transport.",
          "Upload the purchase invoice (optional).",
          "The balance increases, the latest purchase price becomes the material's current price, and the amount is added to the supplier's balance.",
        ],
        notes: ["The purchase itself (material and transport) is not deducted from the treasury - that happens when you record a payment to the supplier from the Suppliers page: cash immediately, a check once it clears (from the credit balance)."],
      },
      {
        title: "Issuing to a project and returns",
        icon: "output",
        steps: [
          "Click \"Issue to project\", choose the material, then the price batch (if it was bought at more than one price), the project and the quantity.",
          "The quantity is deducted from stock and charged to the project's cost at the price batch you chose.",
          "If some quantity came back from the site, click \"Return\" - you can't return more than was issued to that project.",
        ],
      },
      {
        title: "Fixing any wrong movement (purchase / issue / return / opening balance)",
        icon: "build",
        intro: "Open the material page; in \"Purchase history\" or \"Movement history\" you'll find action buttons next to each movement:",
        steps: [
          "Edit a purchase: change the quantity, price, supplier or transport cost. The supplier balance is adjusted automatically.",
          "Edit an issue: change the quantity, the price batch or even the project (if it was issued to the wrong project).",
          "Edit a return, opening balance or stock-count adjustment: quantity, date and notes.",
          "Delete a movement: the quantity is added back to/deducted from the balance, and the movement is removed from the project cost or the supplier balance (including its transport).",
        ],
        notes: [
          "The system rejects any change that would make a balance negative - e.g. you can't delete a purchase that was already issued to projects; edit/delete the issues first.",
          "Every change to a movement linked to a project is recorded in that project's audit log.",
        ],
      },
      {
        title: "Stock-count adjustment",
        icon: "fact_check",
        steps: [
          "Open the material and click \"Stock count\".",
          "Enter the quantity you actually found in the warehouse.",
          "The difference (surplus or shortage) is recorded as a \"Stock count\" movement and the balance is corrected - with no effect on the treasury or projects.",
        ],
      },
      {
        title: "Merging a duplicate material / deleting a material",
        icon: "merge",
        steps: [
          "If a material was recorded twice by mistake: open the wrong copy, click \"Merge\" and choose the correct material - all movements are moved, the balance is combined and the wrong copy is deleted.",
          "To delete a material permanently click \"Delete\": you'll see a summary of the movements, projects and suppliers affected.",
          "If the material has movements you must type the word \"Delete\" to confirm - all movements are deleted and removed from project costs and supplier balances (including transport).",
        ],
        notes: ["If you're deleting a material to re-create it correctly, it's usually easier to edit its details or merge it instead."],
      },
    ],
    faqs: [
      { q: "I entered a wrong quantity in a purchase?", a: "Open the material → Purchase history → the edit icon next to the purchase → correct the quantity and save. The balance and the supplier balance are updated automatically." },
      { q: "I issued material to the wrong project?", a: "In the movement history click edit on the issue and change the project. The cost is removed from the wrong project and added to the right one." },
      { q: "I made a wrong payment to a supplier?", a: "Payments are edited from the supplier page (Suppliers → supplier → Payments → edit/delete), and their treasury effect is adjusted automatically." },
      { q: "Why can't I delete a purchase?", a: "Because part of that quantity was issued to projects, and deleting it would make the balance negative. Edit or delete the issues at the same price first." },
      { q: "How is the material's current price determined?", a: "The latest purchase price (or the opening balance if there are no purchases). You can also change it manually from Edit details." },
      { q: "What's the difference between a \"Stock count\" and editing a movement?", a: "Edit when a movement was recorded wrongly. Use a stock count when all movements are correct but the actual quantity differs (damaged, lost, miscounted)." },
      { q: "Can inventory changes mess up the treasury?", a: "No. Inventory movements (purchase, issue, return, count) have no direct effect on the treasury. The treasury is only affected when you pay the supplier: cash immediately, a check once it clears." },
      { q: "When is transport deducted from the treasury?", a: "With the supplier payment. If the material costs 100 and transport 10, you owe the supplier 110, and when you pay the 110 (cash or a cleared check) it is deducted from the treasury once. Transport is recorded separately only so you know the material's cost including transport." },
    ],
  },

  "/suppliers": {
    title: "Suppliers",
    icon: "local_shipping",
    summary: "Supplier details, purchases from each supplier, the payments made to them (cash/credit/checks), and the remaining balance you owe each supplier.",
    sections: [
      {
        title: "Adding a supplier",
        icon: "person_add",
        steps: ["Click \"New supplier\".", "Enter the name, phone, email and address.", "Save - the supplier will appear in the supplier list when recording a purchase."],
      },
      {
        title: "Following a supplier's account",
        icon: "account_balance",
        steps: [
          "Open the supplier: you'll see total purchases, total paid, and the remaining balance.",
          "The purchase history is filled automatically from inventory purchases (material, quantity, price and transport).",
          "You can correct any purchase with the \"Fix mistake\" button.",
        ],
      },
      {
        title: "Paying a supplier",
        icon: "payments",
        steps: [
          "On the supplier page click \"Record payment\".",
          "Enter the amount split into cash/credit, or choose a check and set its due date.",
          "Cash/credit is deducted from the treasury immediately. A check reduces the amount owed right away, but is deducted from the treasury only when you settle it as \"Cleared\".",
        ],
        notes: ["When a check is cleared it is deducted from the treasury's credit balance, not cash.", "You can't pay more than the remaining balance owed to the supplier."],
      },
      {
        title: "Settling checks",
        icon: "event_available",
        steps: [
          "Due checks appear in the \"Checks due\" card and in the notifications bell.",
          "Click \"Settle\" and choose: Cleared (deducted from credit) / Postpone to a new date / Cancel.",
        ],
      },
    ],
    faqs: [
      { q: "I recorded a wrong payment to a supplier?", a: "Click the edit icon next to the payment and correct it or delete it - its treasury effect is reversed and re-recorded correctly." },
      { q: "The supplier's remaining balance is negative?", a: "That means you paid more than their recorded purchases - usually a purchase was deleted or edited. Review the payments." },
      { q: "Does a cancelled check count?", a: "No, a cancelled check returns the amount to the balance owed to the supplier and doesn't affect the treasury." },
    ],
  },

  "/clients": {
    title: "Clients",
    icon: "groups",
    summary: "Client details and all of each client's projects, with total contracts, amount collected and remaining balance.",
    sections: [
      {
        title: "Adding a client",
        icon: "person_add",
        steps: ["Click \"New client\".", "Enter the company/client name, phone, email and address.", "Save - the client will appear in the client list when creating a project or an invoice."],
      },
      {
        title: "Following a client's account",
        icon: "account_balance_wallet",
        steps: [
          "Open the client: you'll see total contracts, collected, and the remaining balance across all their projects.",
          "The projects table shows each project's status, value and amount collected - click a project to open it.",
        ],
      },
    ],
    faqs: [
      { q: "I want to edit a client's details?", a: "Open the client and click \"Edit\"." },
      { q: "I can't delete a client?", a: "A client with recorded projects can't be deleted. Delete their projects first or keep the client." },
      { q: "Where are payments recorded?", a: "From the project page itself (Payments tab), and they show up here automatically." },
    ],
  },

  "/employees": {
    title: "Employees",
    icon: "badge",
    summary: "Details of office employees (with a login account and permissions) and workers (without a login), their wage type and amount, and monthly insurance.",
    sections: [
      {
        title: "Adding an employee with a login account",
        icon: "admin_panel_settings",
        steps: [
          "Click \"Register employee with login\".",
          "Enter the name, username and password, and choose the role (the role determines the permissions).",
          "Set the wage type (monthly/daily), its amount, and the monthly insurance amount if any.",
        ],
      },
      {
        title: "Adding a worker (without a login)",
        icon: "engineering",
        steps: [
          "Click \"New worker\".",
          "Enter the name, phone, wage type and amount.",
          "The worker appears in the worker list when creating a mission and when running payroll.",
        ],
      },
      {
        title: "Editing or suspending an employee",
        icon: "manage_accounts",
        steps: [
          "Open the employee and click \"Edit\" to change their details, wage or password.",
          "You can suspend the employee instead of deleting them so their financial history is kept.",
          "The employee page shows their advances, deductions, bonuses and the salaries paid to them.",
        ],
      },
    ],
    faqs: [
      { q: "An employee forgot their password?", a: "Open the employee → Edit → enter a new password. If you leave it empty it won't change." },
      { q: "What's the difference between an employee and a worker?", a: "An employee has a login to the system with permissions based on their role; a worker has no account and is recorded only for missions and payroll." },
    ],
  },

  "/payroll": {
    title: "Payroll",
    icon: "payments",
    summary: "Run payroll (individually or in bulk), advances and their installments, deductions and bonuses, and pay employee insurance - every payout is recorded in the treasury automatically.",
    sections: [
      {
        title: "Running payroll",
        icon: "play_circle",
        steps: [
          "In the \"Run payroll\" tab choose the employee and the period (from - to).",
          "The system calculates: base + extra mission-days pay + bonuses - deductions - advance installment - insurance deduction.",
          "For daily workers: base = daily wage × the days in the period excluding Fridays (Friday is a day off with no wage). E.g. a month with 4 Fridays = 26 days instead of 30. If the worker was on a mission on a Friday, they get the full mission rate for that day.",
          "Review the net amount and click pay - the amount is deducted from the treasury.",
          "In \"Bulk payroll\" select the employees and click \"Pay selected\" to run the same calculation for all of them at once.",
        ],
        notes: ["You can't run the same period twice for the same employee."],
      },
      {
        title: "Advances",
        icon: "request_quote",
        steps: [
          "Click \"New advance\", choose the employee, the advance amount and the installment amount.",
          "The advance is deducted from the treasury immediately, and the installment is deducted automatically from each salary until the advance is paid off.",
        ],
      },
      {
        title: "Deductions and bonuses",
        icon: "tune",
        steps: [
          "In the \"Deductions & bonuses\" tab click \"New deduction / bonus\", choose the employee, type, amount, reason and date.",
          "It is applied automatically in the first payroll run for the period containing that date.",
        ],
      },
      {
        title: "Employee insurance",
        icon: "health_and_safety",
        steps: [
          "Each employee's monthly insurance is set in their details.",
          "In the \"Employee insurance\" tab click \"Pay insurance\" to pay the amount due - it is deducted from the treasury.",
        ],
      },
    ],
    faqs: [
      { q: "I paid a wrong salary?", a: "Edit or delete the payout from \"Latest payouts\" - its treasury effect is reversed. Or record a \"Deduction\"/\"Bonus\" for the difference to be applied in the next salary." },
      { q: "How is mission-days pay calculated?", a: "Each worker on a mission has a daily rate set when the mission is created (double their daily wage by default). Payroll adds the difference between the mission rate and the regular daily wage for each mission day in the period." },
      { q: "A deduction/bonus wasn't applied?", a: "It is only applied if its date falls within the payroll period that was run. Once applied it is marked as \"Applied\"." },
    ],
  },

  "/cashbox": {
    title: "Treasury",
    icon: "account_balance_wallet",
    summary:
      "The company's central treasury with two balances: cash and credit. Every financial transaction in the system (payments, expenses, salaries, advances, custodies...) is recorded here automatically and linked to its source.",
    sections: [
      {
        title: "Reading balances and transactions",
        icon: "account_balance",
        steps: [
          "At the top: the cash balance, the credit balance, and the total balance.",
          "The transactions table shows every incoming (+) or outgoing (-) transaction with its source, the related project/supplier and the user.",
          "Use the filters (date, type, in/out, search) - the totals under the table are calculated on the filtered results.",
        ],
      },
      {
        title: "General petty expense (not for a project)",
        icon: "receipt",
        steps: [
          "Click \"Petty expense\" and choose the type (administrative / operational / other).",
          "Enter the amount in cash and/or credit, the notes, and upload the invoice.",
          "It is deducted from the treasury immediately. If the expense belongs to a project, record it from the project page instead.",
        ],
      },
      {
        title: "Issuing and settling a custody",
        icon: "wallet",
        steps: [
          "In the \"Side custodies\" tab click \"New custody\", choose the employee, the amount (cash/credit) and the description.",
          "If the custody belongs to a project, choose it in \"Link to project\" - it will appear in the project's expenses and count toward its profit.",
          "When the employee comes back click \"Settle\" and enter the actual amount spent: the remainder goes back to the treasury, and any excess is paid to the employee.",
          "A custody linked to a project can also be issued and settled from the project page itself.",
        ],
      },
      {
        title: "Adjusting the treasury balance manually",
        icon: "edit_note",
        steps: [
          "Click \"Adjust treasury balance\" and enter the correct cash and credit balances and the reason.",
          "The difference is recorded as a \"Manual adjustment\" transaction so the log keeps matching the balance.",
        ],
        notes: ["Use it only to fix a real discrepancy (cash count). Mistakes in a specific transaction should be fixed at their source (the payment/expense itself)."],
      },
    ],
    faqs: [
      { q: "Are checks recorded as cash or credit?", a: "Any cleared check is recorded on the credit balance - whether it's incoming from a client or outgoing to a supplier." },
      { q: "Why can't I delete a transaction directly here?", a: "Every transaction is linked to its source. Delete/edit the source (payment, expense, custody...) and the treasury transaction is updated with it automatically." },
      { q: "I changed something in inventory, did it affect the treasury?", a: "No. Inventory changes only affect supplier balances and project costs; the treasury is affected when you record a payment to the supplier." },
      { q: "I issued a custody and need to change its amount?", a: "Click edit on the custody - the old transaction is reversed and re-recorded with the new amount." },
    ],
  },

  "/invoices": {
    title: "Invoices",
    icon: "receipt_long",
    summary: "All invoice attachments uploaded with any financial transaction in the system, in one place - plus issuing and printing new electronic invoices.",
    sections: [
      {
        title: "Invoice attachments",
        icon: "attach_file",
        steps: [
          "Any invoice you upload with a purchase, payment or expense appears here automatically.",
          "Filter by type, direction (in/out) and date, or search by description, project or supplier.",
          "Click \"View\" to open the invoice.",
        ],
      },
      {
        title: "Issuing an electronic invoice",
        icon: "post_add",
        steps: [
          "Click \"New electronic invoice\".",
          "Choose the client (their details are filled in automatically) or enter the recipient's details.",
          "Add the line items (description, quantity, unit price) and the tax rate if any.",
          "Save - the invoice gets an automatic serial number, and you can print it or save it as PDF.",
        ],
        notes: ["The printed invoice itself is always issued in Arabic, as an official document for the client."],
      },
    ],
    faqs: [
      { q: "Does an electronic invoice affect the treasury?", a: "No, it's just a document. The actual collection is recorded as a payment on the project." },
      { q: "I want to fix an issued invoice?", a: "Delete it and issue a new, correct one." },
    ],
  },

  "/ai-chat": {
    title: "AI assistant",
    icon: "forum",
    summary: "An assistant that reads the system's data and answers you about projects, inventory, clients, suppliers, treasury, invoices, employees, alerts and tenders. All messages are saved so you can come back to them any time.",
    sections: [
      {
        title: "Asking a question",
        icon: "send",
        steps: [
          "Type your question in the box below and press Enter or the send button (Shift+Enter for a new line).",
          "Your message appears right away, with an indicator that the AI is typing until the reply arrives - sometimes the reply takes a few seconds.",
          "The assistant remembers the latest messages in the conversation, so you can ask a follow-up like \"give me the details of the first one\" or \"how much was collected from the second?\".",
        ],
      },
      {
        title: "Where do the answers come from?",
        icon: "info",
        steps: [
          "Answers come from the system's current data: projects, inventory and purchase history, clients, suppliers, treasury, invoices, employees and payroll, missions, alerts, and recorded tenders.",
          "The assistant only sees the data you are allowed to see on the screens - if you ask about something outside your permissions it will tell you so.",
          "If the information isn't in the system it will say it's not available instead of guessing.",
          "The assistant is read-only - it doesn't edit or delete any data. Any change is made from its own screen.",
        ],
      },
      {
        title: "Going back to older messages",
        icon: "history",
        steps: [
          "The page opens on the latest messages only, to stay fast.",
          "When you scroll up, older messages load automatically batch by batch until \"Start of conversation\".",
        ],
      },
      {
        title: "If sending fails",
        icon: "error",
        steps: [
          "The message stays visible with a red border and the error reason under it.",
          "Click \"Retry\" to send it again, or \"Delete\" to remove it.",
          "A failed message is not saved in the conversation - only questions that got a reply are saved.",
        ],
      },
    ],
    faqs: [
      { q: "Can anyone else see my conversation?", a: "No, each user only sees their own conversation." },
      { q: "How do I clear the conversation?", a: "With the \"Clear conversation\" button at the top. Clearing is permanent and can't be undone." },
      { q: "Can the assistant change anything in the system?", a: "No, the assistant is currently for reading and queries only." },
    ],
  },

  "/ai-tenders": {
    title: "AI tenders",
    icon: "request_quote",
    summary: "Tenders the AI found matching the company's activity, with the tender document details and the reason for the match.",
    sections: [
      {
        title: "Browsing tenders",
        icon: "travel_explore",
        steps: [
          "Each card shows the tender title, the issuing entity, the type and the deadline.",
          "Click a tender to see the details: scope of work, materials and quantities, bid bond, document price, contact details.",
          "\"Match reason\" explains why the AI thinks it suits you.",
        ],
      },
      {
        title: "Dismissing a tender",
        icon: "block",
        steps: ["If you're not interested in a tender, click \"Not interested in this tender?\" to remove it from the list."],
      },
    ],
    faqs: [{ q: "Where do the tenders come from?", a: "From the external AI service connected to the system, based on the company's activity." }],
  },
};
