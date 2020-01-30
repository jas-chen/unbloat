const PRIMARY_COLOR = '#007bff';

test(__filename, async () => {
  await css`
    .btn {
      cursor: pointer;
      color: #fff;
      background-color: ${PRIMARY_COLOR};
      text-align: center;
      user-select: none;
      border: 1px solid ${PRIMARY_COLOR};
      padding: .375rem .75rem;
      border-radius: .25rem;
      transition: background-color .15s ease-in-out,border-color .15s ease-in-out;

      &:hover {
        background-color: #0069d9;
        border-color: #0062cc;
      }
    }

    @media (min-width: 501px) {
      .btn {
        display: inline-block;
      }
    }

    @media (max-width: 500px) {
      .btn {
        display: block;
      }
    }
  `;
});
