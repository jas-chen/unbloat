test(__filename, async () => {
  await css`
    .btn {
      color   :    ${'#fff'};
      background: ${'red'};
      margin:
        0 0
        0 0;

      display: inline-block !important;

      @media (max-width: 500px) {
        border: none;
      }
    }
  `;
});
