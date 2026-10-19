function buildThumbStyle(game, extraHeight) {
  const height = extraHeight ? `height: ${extraHeight};` : '';
  if (game.coverImage) {
    return `${height} background-image: url('${game.coverImage}'); background-size: cover; background-position: center;`;
  }
  return `${height} background: ${game.coverColor};`;
}