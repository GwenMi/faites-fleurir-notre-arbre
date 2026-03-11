import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all non-completed tasks where reminder hasn't been sent yet
    const tasks = await base44.asServiceRole.entities.WeddingTask.filter({
      status: { $ne: "termine" },
      reminder_sent: false,
    });

    let sent = 0;

    for (const task of (tasks || [])) {
      if (!task.due_date || !task.assigned_to_email) continue;

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
      const reminderDays = task.reminder_days_before || 3;

      if (daysUntil <= reminderDays && daysUntil >= 0) {
        const dueDateStr = dueDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

        const subject = daysUntil === 0
          ? `⏰ Rappel : "${task.title}" est dû aujourd'hui !`
          : `⏰ Rappel : "${task.title}" dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`;

        const body = `Bonjour ${task.assigned_to_name || ""},

Vous avez une tâche à accomplir pour la préparation du mariage :

📋 Tâche : ${task.title}
📅 Date limite : ${dueDateStr}
${task.notes ? `📝 Notes : ${task.notes}` : ""}

${daysUntil === 0
  ? "⚠️ Cette tâche est due aujourd'hui, pensez à la finaliser !"
  : `Il vous reste ${daysUntil} jour${daysUntil > 1 ? "s" : ""} pour la compléter.`}

Bonne organisation 🌸
L'équipe Fleurs de fête`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: task.assigned_to_email,
          subject,
          body,
        });

        await base44.asServiceRole.entities.WeddingTask.update(task.id, { reminder_sent: true });
        sent++;
      }
    }

    return Response.json({ success: true, tasks_checked: tasks?.length || 0, reminders_sent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});