const PRIMARY_COLOR = '#007bff';

test(__filename, async () => {
  await css`
    .primary-btn {
      cursor: pointer;
      color: #fff;
      background-color: ${PRIMARY_COLOR};
      text-align: center;
      user-select: none;
      border: 1px solid ${PRIMARY_COLOR};
      padding: .375rem .75rem;
      border-radius: .25rem;
      transition:
        color .15s ease-in-out,
        background-color .15s ease-in-out,
        border-color .15s ease-in-out;

      &:hover {
        background-color: #0069d9;
        border-color: #0062cc;
      }
    }

    @media (min-width: 501px) {
      .primary-btn {
        display: inline-block;
      }
    }

    @media (max-width: 500px) {
      .primary-btn {
        display: block;
      }
    }

    .light-btn {
      cursor: pointer;
      color: #212529;
      background-color: #f8f9fa;
      text-align: center;
      user-select: none;
      border: 1px solid #f8f9fa;
      padding: .375rem .75rem;
      border-radius: .25rem;
      transition:
        color .15s ease-in-out,
        background-color .15s ease-in-out,
        border-color .15s ease-in-out;

      &:hover {
        color: #212529;
        background-color: #e2e6ea;
        border-color: #dae0e5;
      }
    }

    @media (min-width: 501px) {
      .light-btn {
        display: inline-block;
      }
    }

    @media (max-width: 500px) {
      .light-btn {
        display: block;
      }
    }
  `;
});
