namespace TimPurdum.Dev;

public static class StringExtensions
{
    public static string KebabCaseToTitleCase(this string str)
    {
        if (string.IsNullOrEmpty(str))
        {
            return str;
        }

        ReadOnlySpan<char> input = str;
        var result = new System.Text.StringBuilder(str.Length);

        bool capitalize = true;
        for (int i = 0; i < input.Length; i++)
        {
            char c = input[i];
            if (c == '-')
            {
                result.Append(' ');
                capitalize = true;
            }
            else
            {
                if (capitalize)
                {
                    result.Append(char.ToUpperInvariant(c));
                    capitalize = false;
                }
                else
                {
                    result.Append(char.ToLowerInvariant(c));
                }
            }
        }

        return result.ToString();
    }
}
