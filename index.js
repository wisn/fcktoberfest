module.exports = app => {
  app.on('pull_request.opened', async context => {
    let qualityPR = false;
    const prTitle = context.payload.pull_request.title;
    const qualityPRTitles = [/(improve)+d?\ (doc)+s?/i];

    qualityPRTitles.forEach(qualityPRTitle => {
      if (!qualityPR) {
        qualityPR = qualityPRTitle.test(prTitle);
      }
    });

    if (qualityPR) {
      const invalidLabel = context.issue({ name: 'invalid' });
      if (!context.github.issues.getLabel(invalidLabel)) {
        context.github.issues.createLabel(invalidLabel);
      }

      const spamLabel = context.issue({ name: 'spam' });
      if (!context.github.issues.getLabel(spamLabel)) {
        context.github.issues.createLabel(spamLabel);
      }

      const prComment = context.issue({
        body: [
          "Thank you for your contribution!",
          "\n\nHowever, your pull request is identified as a spam.",
          "That's why you got `invalid` & `spam` labels",
          "and your pull request closed immediately.",
          "\n\nIf you are doing this just for some free Hacktoberfest swags",
          "then good luck and please don't come back!",
          "\n\nIn the other hands, if you are doing quality contribution then",
          "please mention the maintainers right away.",
          "\n\n\nCheers!",
        ].join(" "),
      });
      context.github.issues.createComment(prComment);

      const assignLabels = context.issue({ labels: ['invalid', 'spam'] });
      context.github.issues.addLabels(assignLabels);

      const closePR = context.pullRequest({ state: 'closed' });
      return context.github.pulls.update(closePR);
    }
  });
};
