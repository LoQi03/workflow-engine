using System.Linq.Expressions;

namespace WorkflowEngine.Data.Repositories;

/// <summary>
/// Translates an <see cref="Expression{TDelegate}"/> targeting a source type to an equivalent expression
/// targeting a destination type by remapping member accesses that share the same property name.
/// </summary>
/// <typeparam name="TSource">The source type (e.g. a DTO) used in the original expression.</typeparam>
/// <typeparam name="TDestination">The destination type (e.g. an entity) to which the expression is translated.</typeparam>
internal static class ExpressionMapper<TSource, TDestination>
{
    /// <summary>
    /// Converts an <see cref="Expression{Func}"/> from <typeparamref name="TSource"/> to
    /// <typeparamref name="TDestination"/> by replacing parameter and member references.
    /// </summary>
    /// <param name="source">The source expression targeting <typeparamref name="TSource"/>.</param>
    /// <returns>An expression targeting <typeparamref name="TDestination"/> with equivalent semantics.</returns>
    public static Expression<Func<TDestination, bool>> MapExpression(Expression<Func<TSource, bool>> source)
    {
        var sourceParam = source.Parameters[0];
        var destParam = Expression.Parameter(typeof(TDestination), sourceParam.Name);
        var body = new ParameterReplacer(sourceParam, destParam).Visit(source.Body);
        return Expression.Lambda<Func<TDestination, bool>>(body, destParam);
    }

    private sealed class ParameterReplacer(ParameterExpression source, ParameterExpression destination) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node)
            => node == source ? destination : base.VisitParameter(node);

        protected override Expression VisitMember(MemberExpression node)
        {
            if (node.Expression == source)
            {
                var destMember = typeof(TDestination).GetProperty(node.Member.Name)
                    ?? throw new InvalidOperationException(
                        $"Property '{node.Member.Name}' does not exist on type '{typeof(TDestination).Name}'.");
                return Expression.MakeMemberAccess(destination, destMember);
            }

            return base.VisitMember(node);
        }
    }
}
